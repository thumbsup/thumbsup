# Node.js + build dependencies + runtime dependencies
FROM thumbsupgallery/build:alpine

# Switch to a non-root user
# So we can test edge-cases around file permissions
RUN adduser -D tester
RUN chown -R tester:tester /app
USER tester

# Install and cache dependencies
COPY --chown=tester package.json /app
RUN npm install

# Copy the entire source code
COPY --chown=tester . /app

# Run the tests
RUN npm test
