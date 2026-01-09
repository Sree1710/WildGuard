"""
Dataset Verification Script
============================
Verify that datasets are properly organized before training.

This script checks:
- Folder structure exists
- Files are present in each category
- File formats are correct
- Minimum file counts are met

Run before training to ensure datasets are ready.
"""

import os
import glob
from pathlib import Path

# Dataset paths
DATASET_ROOT = Path(__file__).parent / "datasets"
AUDIO_PATH = DATASET_ROOT / "audio"
IMAGE_PATH = DATASET_ROOT / "images"

# Minimum file requirements
MIN_AUDIO_FILES = 50  # Minimum per category
MIN_IMAGE_FILES = 100  # Minimum per category

# Supported formats
AUDIO_FORMATS = ['.wav', '.mp3', '.flac']
IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.bmp']


def check_folder_structure():
    """Check if all required folders exist."""
    print("=" * 70)
    print("CHECKING FOLDER STRUCTURE")
    print("=" * 70)
    
    required_folders = [
        AUDIO_PATH / "animal",
        AUDIO_PATH / "human",
        AUDIO_PATH / "gunshot",
        IMAGE_PATH / "animal",
        IMAGE_PATH / "human"
    ]
    
    all_exist = True
    for folder in required_folders:
        if folder.exists():
            print(f"✓ {folder.relative_to(DATASET_ROOT)}")
        else:
            print(f"✗ {folder.relative_to(DATASET_ROOT)} - MISSING!")
            all_exist = False
    
    return all_exist


def count_files_by_extension(folder, extensions):
    """Count files with specific extensions in a folder."""
    count = 0
    for ext in extensions:
        count += len(list(folder.glob(f"*{ext}")))
        count += len(list(folder.glob(f"*{ext.upper()}")))
    return count


def check_audio_files():
    """Check audio dataset files."""
    print("\n" + "=" * 70)
    print("CHECKING AUDIO DATASET")
    print("=" * 70)
    
    categories = ["animal", "human", "gunshot"]
    results = {}
    
    for category in categories:
        folder = AUDIO_PATH / category
        if not folder.exists():
            print(f"\n✗ {category}: Folder does not exist")
            results[category] = 0
            continue
        
        count = count_files_by_extension(folder, AUDIO_FORMATS)
        results[category] = count
        
        status = "✓" if count >= MIN_AUDIO_FILES else "⚠"
        print(f"\n{status} {category}:")
        print(f"   Files found: {count}")
        print(f"   Minimum required: {MIN_AUDIO_FILES}")
        
        if count < MIN_AUDIO_FILES:
            print(f"   ⚠ WARNING: Need {MIN_AUDIO_FILES - count} more files")
        
        # Show file breakdown by format
        for ext in AUDIO_FORMATS:
            ext_count = len(list(folder.glob(f"*{ext}")))
            if ext_count > 0:
                print(f"   - {ext}: {ext_count} files")
    
    return results


def check_image_files():
    """Check image dataset files."""
    print("\n" + "=" * 70)
    print("CHECKING IMAGE DATASET")
    print("=" * 70)
    
    categories = ["animal", "human"]
    results = {}
    
    for category in categories:
        folder = IMAGE_PATH / category
        if not folder.exists():
            print(f"\n✗ {category}: Folder does not exist")
            results[category] = 0
            continue
        
        count = count_files_by_extension(folder, IMAGE_FORMATS)
        results[category] = count
        
        status = "✓" if count >= MIN_IMAGE_FILES else "⚠"
        print(f"\n{status} {category}:")
        print(f"   Files found: {count}")
        print(f"   Minimum required: {MIN_IMAGE_FILES}")
        
        if count < MIN_IMAGE_FILES:
            print(f"   ⚠ WARNING: Need {MIN_IMAGE_FILES - count} more files")
        
        # Show file breakdown by format
        for ext in IMAGE_FORMATS:
            ext_count = len(list(folder.glob(f"*{ext}")))
            if ext_count > 0:
                print(f"   - {ext}: {ext_count} files")
    
    return results


def check_file_accessibility():
    """Check if sample files can be accessed."""
    print("\n" + "=" * 70)
    print("CHECKING FILE ACCESSIBILITY")
    print("=" * 70)
    
    # Check sample audio file
    animal_audio = list((AUDIO_PATH / "animal").glob("*.*"))
    if animal_audio:
        sample_file = animal_audio[0]
        try:
            size = sample_file.stat().st_size
            print(f"\n✓ Sample audio file accessible:")
            print(f"   Path: {sample_file.name}")
            print(f"   Size: {size / 1024:.2f} KB")
        except Exception as e:
            print(f"\n✗ Error accessing sample audio: {e}")
    else:
        print("\n⚠ No audio files found to test")
    
    # Check sample image file
    animal_images = list((IMAGE_PATH / "animal").glob("*.*"))
    if animal_images:
        sample_file = animal_images[0]
        try:
            size = sample_file.stat().st_size
            print(f"\n✓ Sample image file accessible:")
            print(f"   Path: {sample_file.name}")
            print(f"   Size: {size / 1024:.2f} KB")
        except Exception as e:
            print(f"\n✗ Error accessing sample image: {e}")
    else:
        print("\n⚠ No image files found to test")


def generate_summary(audio_results, image_results):
    """Generate overall summary."""
    print("\n" + "=" * 70)
    print("DATASET VERIFICATION SUMMARY")
    print("=" * 70)
    
    # Audio summary
    total_audio = sum(audio_results.values())
    print(f"\n📊 AUDIO DATASET:")
    print(f"   Total files: {total_audio}")
    for category, count in audio_results.items():
        status = "✓" if count >= MIN_AUDIO_FILES else "✗"
        print(f"   {status} {category}: {count} files")
    
    # Image summary
    total_images = sum(image_results.values())
    print(f"\n📊 IMAGE DATASET:")
    print(f"   Total files: {total_images}")
    for category, count in image_results.items():
        status = "✓" if count >= MIN_IMAGE_FILES else "✗"
        print(f"   {status} {category}: {count} files")
    
    # Overall status
    audio_ready = all(count >= MIN_AUDIO_FILES for count in audio_results.values())
    image_ready = all(count >= MIN_IMAGE_FILES for count in image_results.values())
    
    print("\n" + "=" * 70)
    if audio_ready and image_ready:
        print("✅ DATASET VERIFICATION PASSED")
        print("=" * 70)
        print("\nYou are ready to train models!")
        print("Run: python train_audio_model.py")
        print("Run: python train_image_model.py")
    else:
        print("⚠️  DATASET VERIFICATION INCOMPLETE")
        print("=" * 70)
        print("\nPlease add more files to the following categories:")
        if not audio_ready:
            for category, count in audio_results.items():
                if count < MIN_AUDIO_FILES:
                    print(f"   - audio/{category}/: Need {MIN_AUDIO_FILES - count} more files")
        if not image_ready:
            for category, count in image_results.items():
                if count < MIN_IMAGE_FILES:
                    print(f"   - images/{category}/: Need {MIN_IMAGE_FILES - count} more files")
        print("\nRefer to datasets/README.md for download instructions.")


def main():
    """Main verification process."""
    print("\n🔍 WildGuard Dataset Verification")
    print("=" * 70)
    print(f"Dataset root: {DATASET_ROOT.absolute()}")
    print("=" * 70)
    
    # Step 1: Check folder structure
    folders_ok = check_folder_structure()
    
    if not folders_ok:
        print("\n❌ ERROR: Folder structure incomplete!")
        print("Please create the required folders and try again.")
        return
    
    # Step 2: Check audio files
    audio_results = check_audio_files()
    
    # Step 3: Check image files
    image_results = check_image_files()
    
    # Step 4: Check file accessibility
    check_file_accessibility()
    
    # Step 5: Generate summary
    generate_summary(audio_results, image_results)


if __name__ == "__main__":
    main()
