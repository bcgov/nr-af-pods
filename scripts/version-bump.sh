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

    # Increment patch version
    patch=$((patch + 1))

    # If patch version exceeds 9, increment minor version and reset patch to 0
    if [ "$patch" -gt 9 ]; then
        patch=0
        minor=$((minor + 1))

        # If minor version exceeds 9, increment major version and reset minor to 0
        if [ "$minor" -gt 9 ]; then
            minor=0
            major=$((major + 1))
        fi
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
        case "$file_path" in
            *"application.js" | *"claim.js")
                # Update version number in JavaScript files
                sed -i '' -E "s/powerpod-$old_version\.min\.js/powerpod-$new_version.min.js/g" "$file_path"
                ;;
            "powerpod/package.json")
                # Update version number in package.json
                sed -i '' -E "s/\"version\": \"$old_version\"/\"version\": \"$new_version\"/g" "$file_path"
                ;;
            "powerpod/rollup.config.js")
                # Update version number in rollup.config.js
                sed -i '' -E "s/\* powerpod $old_version/\* powerpod $new_version/g" "$file_path"
                ;;
            "powerpod/src/js/powerpod.js")
                # Update version number in powerpod.js
                sed -i '' -E "s/POWERPOD.version = '$old_version'/POWERPOD.version = '$new_version'/g" "$file_path"
                ;;
            *)
                echo "Unsupported file: $file_path"
                ;;
        esac
        echo "Updated $file_path with new version $new_version"
    else
        echo "File $file_path not found!"
    fi
done

cp ./powerpod/dist/powerpod.min.js "./powerpod/releases/powerpod-${new_version}.min.js"
