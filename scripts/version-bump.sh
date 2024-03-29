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
    echo "Detected current version to be $old_version"
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

    echo "Updating version from $old_version to $new_version..."
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
                # Prompt user before updating JavaScript files
                read -p "Do you want to update $file_path? [Y/N]: " answer
                if [[ "$answer" == "Y" || "$answer" == "y" ]]; then
                    sed -i '' -E "s/powerpod-[0-9]+\.[0-9]+\.[0-9]+\.min\.js/powerpod-$new_version.min.js/g" "$file_path"
                    echo "Updated $file_path with new version $new_version"
                else
                    echo "Skipping $file_path"
                fi
                ;;
            "powerpod/package.json")
                # Update version number in package.json
                sed -i '' -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$new_version\"/g" "$file_path"
                echo "Updated $file_path with new version $new_version"
                ;;
            "powerpod/rollup.config.js")
                # Update version number in rollup.config.js
                sed -i '' -E "s/\* powerpod [0-9]+\.[0-9]+\.[0-9]+/\* powerpod $new_version/g" "$file_path"
                echo "Updated $file_path with new version $new_version"
                ;;
            "powerpod/src/js/powerpod.js")
                # Update version number in powerpod.js
                sed -i '' -E "s/POWERPOD\.version = '[0-9]+\.[0-9]+\.[0-9]+'/POWERPOD.version = '$new_version'/g" "$file_path"
                echo "Updated $file_path with new version $new_version"
                ;;
            *)
                echo "Unsupported file: $file_path"
                ;;
        esac
    else
        echo "File $file_path not found!"
    fi
done

cp ./powerpod/dist/powerpod.min.js "./powerpod/releases/powerpod-${new_version}.min.js"
