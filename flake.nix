{
  description = "A nix-flake-based packaging of thumbsup";

  inputs = {
    pre-commit-hooks.url = "github:cachix/pre-commit-hooks.nix";
  };

  outputs = {
    self,
    nixpkgs,
    pre-commit-hooks,
  }: let
    supportedSystems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];
    forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
  in {
    checks = forAllSystems (system: {
      pre-commit-check = pre-commit-hooks.lib.${system}.run {
        src = ./.;
        hooks = {
          alejandra.enable = true;
          alejandra.settings = {
            check = true;
          };
          deadnix.enable = true;
          deadnix.settings = {
            noLambdaArg = true;
            noLambdaPatternNames = true;
          };
          statix.enable = true;
        };
      };
    });

    packages = forAllSystems (system: {
      default = nixpkgs.legacyPackages.${system}.buildNpmPackage {
        pname = "thumbsup";
        version = "2.18.0";
        src = ./.;

        npmDepsHash = "sha256-JcQvKwavHqSN5IK8Aal7KEew40afDmoBhEXSiHOhbz4=";
        npmPackFlags = ["--ignore-scripts"];
        dontNpmBuild = true;
        NODE_OPTIONS = "--openssl-legacy-provider";

        meta = with nixpkgs.legacyPackages.${system}.lib; {
          homepage = "https://github.com/thumbsup/thumbsup";
          description = "Thumbsup is a static gallery generator.";
          mainProgram = "thumbsup";
          longDescription = ''
            Thumbsup is a static gallery generator. Point it at a folder full
            of photos and videos, and it will build an HTML website to view
            them. It takes care of resizing photos, creating thumbnails,
            re-encoding videos to a web-friendly format, and more.
          '';
          maintainers = [maintainers.x123];
          license = licenses.mit;
        };
      };
    });

    devShells = forAllSystems (system: {
      default = nixpkgs.legacyPackages.${system}.mkShell {
        inherit (self.checks.${system}.pre-commit-check) shellHook;
        buildInputs = self.checks.${system}.pre-commit-check.enabledPackages;
        packages = [
          self.packages.${system}.default

          # Package ‘dcraw-9.28.0’ is marked as insecure due to CVEs:
          # CVE-2018-19655
          # CVE-2018-19565
          # CVE-2018-19566
          # CVE-2018-19567
          # CVE-2018-19568
          # if you wish to enable dcraw the following line can be uncommented
          # nixpkgs.legacyPackages.${system}.dcraw

          nixpkgs.legacyPackages.${system}.exiftool
          nixpkgs.legacyPackages.${system}.ffmpeg
          nixpkgs.legacyPackages.${system}.gifsicle
          nixpkgs.legacyPackages.${system}.graphicsmagick
          nixpkgs.legacyPackages.${system}.imagemagick
        ];
      };
    });
  };
}
