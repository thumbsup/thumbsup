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

# compare albums with the snapshot
for expected in output-expected/*.html; do
  actual=$(echo "${expected}" | sed s/expected/actual/)
  diff -ub "${expected}" "${actual}"
done

# compare media with the snapshot
IFS=$'\n'; set -f
for expected in $(find output-expected/media -name "*.jpg"); do
  actual=$(echo "${expected}" | sed s/expected/actual/)
  ./imagediff "${expected}" "${actual}"
done
unset IFS; set +f

echo "-------------------------------"
echo "Output is identical to snapshot"
echo "BUILD SUCCESSFUL"
echo "-------------------------------"
