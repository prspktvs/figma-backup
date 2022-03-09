# Figma backup

Downloads any accessible Figma url as a .fig.
Does not require account details or configuration.

### Usage
```
npm install
node index.js "https://figma.com/file/..."
```

### Download path

Use the `DOWNLOAD_PATH` env variable to set the download dir, defaults to /tmp/

### Usage with Docker

Downloads the latest version of Chrome stable to run in headless mode in a docker container.
```
docker build -t figma-backup .
docker run -i --rm -v $PWD:/tmp figma-backup node index.js "https://figma.com/file/..."
```
