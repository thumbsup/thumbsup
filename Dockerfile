FROM mhart/alpine-node:6

# build tools for native dependencies
RUN apk add --update make gcc g++ python git

# ffmpeg
RUN apk add --update ca-certificates ffmpeg

ENV PKGNAME=graphicsmagick
ENV PKGVER=1.3.23
ENV PKGSOURCE=http://downloads.sourceforge.net/$PKGNAME/$PKGNAME/$PKGVER/GraphicsMagick-$PKGVER.tar.lz

# Installing graphicsmagick dependencies
RUN apk add --update g++ \
                     gcc \
                     make \
                     lzip \
                     wget \
                     ffmpeg \
                     libjpeg-turbo-dev \
                     libpng-dev \
                     libtool \
                     libgomp && \
    wget $PKGSOURCE && \
    lzip -d -c GraphicsMagick-$PKGVER.tar.lz | tar -xvf - && \
    cd GraphicsMagick-$PKGVER && \
    ./configure \
      --build=$CBUILD \
      --host=$CHOST \
      --prefix=/usr \
      --sysconfdir=/etc \
      --mandir=/usr/share/man \
      --infodir=/usr/share/info \
      --localstatedir=/var \
      --enable-shared \
      --disable-static \
      --with-modules \
      --with-threads \
      --with-gs-font-dir=/usr/share/fonts/Type1 \
      --with-quantum-depth=16 && \
    make && \
    make install && \
    cd / && \
    rm -rf GraphicsMagick-$PKGVER && \
    rm GraphicsMagick-$PKGVER.tar.lz && \
    apk del g++ \
            gcc \
            make \
            lzip \
            wget

# Thumbsup
RUN npm install -g thumbsup@1.x.x

# Run everthing as a separate user
RUN adduser -D thumbsup
USER thumbsup
WORKDIR /home/thumbsup
