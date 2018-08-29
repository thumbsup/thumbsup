# ------------------------------------------------
# Builder image
# ------------------------------------------------

FROM thumbsupgallery/build:alpine as build

# Install thumbsup locally
WORKDIR /thumbsup
ARG PACKAGE_VERSION
RUN if [ -z "${PACKAGE_VERSION}" ]; then \
      echo "Please specify --build-arg PACKAGE_VERSION=<2.4.1>"; \
      exit 1; \
    fi;
RUN echo '{"name": "installer", "version": "1.0.0"}' > package.json
RUN npm install thumbsup@${PACKAGE_VERSION}

# ------------------------------------------------
# Runtime image
# ------------------------------------------------

FROM thumbsupgallery/runtime:alpine

# Use tini as an init process
# to ensure all child processes (ffmpeg...) are always terminated properly
RUN apk add --update tini
ENTRYPOINT ["tini", "-g", "--"]

# Thumbsup can be run as any user and needs write-access to HOME
ENV HOME /tmp

# Copy the thumbsup files to the new image
COPY --from=build /thumbsup /thumbsup
RUN ln -s /thumbsup/node_modules/.bin/thumbsup /usr/local/bin/thumbsup

# Default command, should be overridden during <docker run>
CMD ["thumbsup"]
