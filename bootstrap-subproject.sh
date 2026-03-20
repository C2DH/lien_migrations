#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <subproject-folder>"
  exit 1
fi

target_dir="${1%/}"

if [[ ! -d "$target_dir" ]]; then
  echo "Error: folder not found: $target_dir"
  exit 1
fi

if find "$target_dir" -maxdepth 1 -type f -name '*.json' | grep -q .; then
  echo "Safety check failed: $target_dir already contains .json file(s)."
  echo "Refusing to modify existing subproject manifests."
  exit 1
fi

shopt -s nullglob

slide_dirs=()
while IFS= read -r dir_path; do
  slide_dirs+=("$(basename "$dir_path")")
done < <(find "$target_dir" -maxdepth 1 -type d -name 'slides*' | sort)

if [[ ${#slide_dirs[@]} -eq 0 ]]; then
  echo "Error: no slide folders found in $target_dir (expected slides/ or slides-<lang>/)."
  exit 1
fi

for folder in "${slide_dirs[@]}"; do
  if [[ "$folder" == "slides" ]]; then
    output_file="slides-en.json"
  else
    output_file="${folder}.json"
  fi

  mapfile -t svg_files < <(find "$target_dir/$folder" -maxdepth 1 -type f -name '*.svg' | sort -V)

  if [[ ${#svg_files[@]} -lt 1 ]]; then
    echo "Validation failed for $folder: must contain at least one .svg file."
    exit 1
  fi

  for svg in "${svg_files[@]}"; do
    filename="$(basename "$svg")"
    if [[ "$filename" == */* ]]; then
      echo "Validation failed for $folder: nested paths are not allowed ($filename)."
      exit 1
    fi
  done

  tmp_file="$(mktemp)"
  printf '[\n' > "$tmp_file"

  for i in "${!svg_files[@]}"; do
    filename="$(basename "${svg_files[$i]}")"
    id="${filename%.svg}"
    file_path="$folder/$filename"

    if [[ -z "$id" ]]; then
      echo "Validation failed for $folder: id must be non-empty ($filename)."
      rm -f "$tmp_file"
      exit 1
    fi

    if [[ ! "$file_path" =~ ^[^/]+/[^/]+\.svg$ ]]; then
      echo "Validation failed for $folder: file path must match <folder>/<filename>.svg ($file_path)."
      rm -f "$tmp_file"
      exit 1
    fi

    line="  { \"id\": \"$id\", \"file\": \"$file_path\" }"
    if [[ "$i" -lt $((${#svg_files[@]} - 1)) ]]; then
      line+=","
    fi
    printf '%s\n' "$line" >> "$tmp_file"
  done

  printf ']\n' >> "$tmp_file"
  mv "$tmp_file" "$target_dir/$output_file"
  echo "Wrote $target_dir/$output_file"
done

if [[ ! -f "$target_dir/index.html" ]]; then
  if [[ ! -f "presences-capverdiennes/index.html" ]]; then
    echo "Error: template not found at presences-capverdiennes/index.html"
    exit 1
  fi

  subproject_name="$(basename "$target_dir")"
  sed -E "s|<title>.*</title>|<title>${subproject_name}</title>|" \
    "presences-capverdiennes/index.html" > "$target_dir/index.html"
  echo "Created $target_dir/index.html"
fi

echo "Bootstrap complete for $target_dir"