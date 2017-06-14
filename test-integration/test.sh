#!/bin/bash
set -eou pipefail

# Run tests inside the integration folder
pushd "${BASH_SOURCE%/*}" >/dev/null || exit
trap finish EXIT
function finish {
  popd >/dev/null
}

# cleanup
rm -rf output-actual

# run thumbsup
thumbsup --config config.json --output output-actual

# compare with expected output (checked-in)
diff -rub -x "metadata.json" -x "public" -x ".DS_Store" output-expected/ output-actual/

echo "-------------------------------"
echo "Output is identical to snapshot"
echo "BUILD SUCCESSFUL"
echo "-------------------------------"
