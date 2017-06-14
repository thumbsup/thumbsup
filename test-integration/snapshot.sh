#!/bin/bash
set -eou pipefail

# Run tests inside the integration folder
pushd "${BASH_SOURCE%/*}" >/dev/null || exit
trap finish EXIT
function finish {
  popd >/dev/null
}

# cleanup
rm -rf output-expected

# run thumbsup
thumbsup --config config.json --output output-expected
