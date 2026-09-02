# WordPress Plugin Packaging Rule

When packaging WordPress plugins or any zip files meant to be uploaded to a Linux-based WordPress server from this Windows environment, NEVER use PowerShell's `Compress-Archive`. 

`Compress-Archive` on Windows stores internal file paths with backslashes (`\`), which causes WordPress on Linux to fail with a "Plugin file does not exist" error because it interprets the folder and filename as a single string (e.g., `folder\plugin.php`).

Instead, ALWAYS use the built-in Windows `tar` utility with the `-a` flag to create zip files, which ensures standard forward slashes (`/`) are used for paths.

Example:
`tar -a -c -f "destination.zip" -C "path\to\parent" "folder_to_zip"`
