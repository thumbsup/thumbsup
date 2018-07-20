
## Automated tests

Thumbsup is covered by several types of tests.

- static code analysis, checking for common errors and enforcing style
- unit and integration tests, with close to 100% coverage

Please make sure the tests are passing when submitting a code change.
Simply run:

```bash
npm test
```

Note: due to the nature of `thumbsup`, some tests require a working runtime environment including `exiftool`, `graphicsmagick` and `ffmpeg`. You can run the entire test suite inside Docker using:

```bash
docker build -f Dockerfile.test .
```

## Manual tests

For more confidence, you can also run `thumbsup` against the demo galleries at https://github.com/thumbsup/demos.
This is valuable when working on a theme or cosmetic changes.

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
