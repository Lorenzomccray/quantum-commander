#!/bin/bash

set -e

echo "🚀 Installing Quantum Commander globally..."

# Create target directory
INSTALL_DIR="$HOME/.quantum-commander"
mkdir -p "$INSTALL_DIR/bin"

# Copy files
cp -r ./lib "$INSTALL_DIR/"
cp -r ./node_modules "$INSTALL_DIR/"
cp ./bin/qc "$INSTALL_DIR/bin/qc"

# Make executable
chmod +x "$INSTALL_DIR/bin/qc"

# Symlink to /usr/local/bin (Linux) or ~/.local/bin fallback
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if [ -w /usr/local/bin ]; then
    sudo ln -sf "$INSTALL_DIR/bin/qc" /usr/local/bin/qc
  else
    mkdir -p "$HOME/.local/bin"
    ln -sf "$INSTALL_DIR/bin/qc" "$HOME/.local/bin/qc"
    echo "🔗 Symlinked to ~/.local/bin/qc (add to your PATH if needed)"
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  ln -sf "$INSTALL_DIR/bin/qc" /usr/local/bin/qc
else
  mkdir -p "$HOME/.local/bin"
  ln -sf "$INSTALL_DIR/bin/qc" "$HOME/.local/bin/qc"
  echo "⚠️ Manual symlink required. Add $INSTALL_DIR to your PATH."
fi

echo "✅ Installation complete!"
echo "Run 'qc --help' from anywhere to begin."
