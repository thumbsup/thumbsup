
Please make sure the tests are passing when submitting a code change:

```bash
cd ~/thumbsup
npm install
./scripts/cibuild
```

For more confidence, you can also run `thumbsup` against the demo galleries at https://github.com/thumbsup/demos

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
