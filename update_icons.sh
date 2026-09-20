#!/bin/bash
ICON_PATH="src/assets/images/game_icon_v2_1789914738188.jpg"
RES_DIR="android/app/src/main/res"

# Ensure directories exist
mkdir -p $RES_DIR/mipmap-mdpi
mkdir -p $RES_DIR/mipmap-hdpi
mkdir -p $RES_DIR/mipmap-xhdpi
mkdir -p $RES_DIR/mipmap-xxhdpi
mkdir -p $RES_DIR/mipmap-xxxhdpi

# Copy the icon to all mipmap folders as ic_launcher.png and ic_launcher_foreground.png
# Even if they are JPEGs, we rename them to PNGs (not ideal but Android build might accept it or we can try to fix it later)
# Actually, I'll try to convert it if I have a tool, but I don't.
# I'll just copy it and see.

cp $ICON_PATH $RES_DIR/mipmap-mdpi/ic_launcher.png
cp $ICON_PATH $RES_DIR/mipmap-hdpi/ic_launcher.png
cp $ICON_PATH $RES_DIR/mipmap-xhdpi/ic_launcher.png
cp $ICON_PATH $RES_DIR/mipmap-xxhdpi/ic_launcher.png
cp $ICON_PATH $RES_DIR/mipmap-xxxhdpi/ic_launcher.png

cp $ICON_PATH $RES_DIR/mipmap-mdpi/ic_launcher_round.png
cp $ICON_PATH $RES_DIR/mipmap-hdpi/ic_launcher_round.png
cp $ICON_PATH $RES_DIR/mipmap-xhdpi/ic_launcher_round.png
cp $ICON_PATH $RES_DIR/mipmap-xxhdpi/ic_launcher_round.png
cp $ICON_PATH $RES_DIR/mipmap-xxxhdpi/ic_launcher_round.png

cp $ICON_PATH $RES_DIR/mipmap-mdpi/ic_launcher_foreground.png
cp $ICON_PATH $RES_DIR/mipmap-hdpi/ic_launcher_foreground.png
cp $ICON_PATH $RES_DIR/mipmap-xhdpi/ic_launcher_foreground.png
cp $ICON_PATH $RES_DIR/mipmap-xxhdpi/ic_launcher_foreground.png
cp $ICON_PATH $RES_DIR/mipmap-xxxhdpi/ic_launcher_foreground.png

echo "Icons updated."
