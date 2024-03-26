#!/bin/bash

old_version="$1"
new_version="$2"

# Function to get current version from package.json
get_current_version() {
    if [ -f "powerpod/package.json" ]; then
        current_version=$(jq -r '.version' "powerpod/package.json")
        echo "$current_version"
    else
        echo "Error: package.json not found!"
        exit 1
    fi
}

# If old_version is not provided, attempt to get current version from package.json
if [ -z "$old_version" ]; then
    old_version=$(get_current_version)
    if [ -z "$old_version" ]; then
        exit 1
    fi
fi

# If new version is not provided, bump the minor version
if [ -z "$new_version" ]; then
    # Extract major, minor, and patch versions
    major=$(echo "$old_version" | cut -d '.' -f1)
    minor=$(echo "$old_version" | cut -d '.' -f2)
    patch=$(echo "$old_version" | cut -d '.' -f3)

    # Increment version numbers
    if [ -z "$patch" ]; then
        # If no patch version, increment minor version
        minor=$((minor + 1))
        patch=0
    else
        # Increment patch version
        patch=$((patch + 1))
    fi

    # If minor version exceeds 9, increment major version
    if [ "$minor" -gt 9 ]; then
        major=$((major + 1))
        minor=0
    fi

    # If major version exceeds 9, reset to 0 (unlikely for typical semantic versioning)
    if [ "$major" -gt 9 ]; then
        major=0
    fi

    new_version="$major.$minor.$patch"
fi

files_to_update=(
    "assets/application/js/application.js"
    "assets/claim/js/claim.js"
    "powerpod/package.json"
    "powerpod/rollup.config.js"
    "powerpod/src/js/powerpod.js"
)

for file_path in "${files_to_update[@]}"; do
    if [ -f "$file_path" ]; then
        # Escape special characters in old_version
        escaped_old_version=$(echo "$old_version" | sed 's/[]\/$*.^|[]/\\&/g')

        # Replace old_version with new_version using sed
        sed -i '' "s/${escaped_old_version}/${new_version}/g" "${file_path}"
        echo "Updated $file_path with new version $new_version"
    else
        echo "File $file_path not found!"
    fi
done

cp ./powerpod/dist/powerpod.min.js "./powerpod/releases/powerpod-${new_version}.min.js"
