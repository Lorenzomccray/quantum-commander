#!/bin/bash

set -e

echo "🚀 Installing Quantum Commander globally..."

# Create target directory
INSTALL_DIR="$HOME/.quantum-commander"
mkdir -p "$INSTALL_DIR"

# Copy files
cp -r ./lib "$INSTALL_DIR/"
cp ./bin/qc "$INSTALL_DIR/qc"

# Make executable
chmod +x "$INSTALL_DIR/qc"

# Symlink to /usr/local/bin (Linux) or ~/.local/bin fallback
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if [ -w /usr/local/bin ]; then
    sudo ln -sf "$INSTALL_DIR/qc" /usr/local/bin/qc
  else
    mkdir -p "$HOME/.local/bin"
    ln -sf "$INSTALL_DIR/qc" "$HOME/.local/bin/qc"
    echo "🔗 Symlinked to ~/.local/bin/qc (add to your PATH if needed)"
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  ln -sf "$INSTALL_DIR/qc" /usr/local/bin/qc
else
  echo "⚠️ Manual symlink required. Add $INSTALL_DIR to your PATH."
fi

echo "✅ Installation complete!"
echo "Run 'qc --help' from anywhere to begin."
