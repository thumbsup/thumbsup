
Please make sure the tests are passing when submitting a code change.

## Automated tests

Thumbsup is covered by several types of tests.

| Command | Tests |
|---------|-------|
| npm run lint | Static code analysis |
| npm run unit | Unit tests |
| npm test | Linting + unit tests |
| scripts/record | Creates a new snapshot |
| scripts/verify | Compares a brand new gallery against the snapshot |
| scripts/cibuild | Runs all possible tests |

Due to the nature of `thumbsup`, even some unit tests require a working runtime environment including `exiftool`, `graphicsmagick` and `ffmpeg`.

You can run the entire test suite inside Docker using:

```bash
docker build .
```

## Manual tests

For more confidence, you can also run `thumbsup` against the demo galleries at https://github.com/thumbsup/demos.
This is also valuable when working on a theme or cosmetic changes.

```bash
# prepare local thumbsup for linking
cd ~/thumbsup
npm install
npm link

# link into the demos and make the galleries
cd ~/demos
npm install
npm link thumbsup
./build
```
