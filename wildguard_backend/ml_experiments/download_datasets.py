"""
Dataset Acquisition Script for WildGuard MCA Project
=====================================================
This script helps acquire additional training data for the ML models.

Methods:
1. Download from ESC-50 dataset (animal/human sounds)
2. Download from Freesound.org API (requires API key)
3. Download sample images from open datasets
4. Generate synthetic audio files for testing/development

Requirements:
    pip install requests librosa soundfile numpy Pillow tqdm

Usage:
    python download_datasets.py --method synthetic --all
    python download_datasets.py --method esc50 --category animal
    python download_datasets.py --method freesound --category gunshot --api-key YOUR_KEY
"""

import os
import sys
import argparse
import random
import requests
import zipfile
import shutil
from pathlib import Path
from io import BytesIO

# Check for required packages
try:
    import numpy as np
    import soundfile as sf
    from PIL import Image
    from tqdm import tqdm
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Install with: pip install numpy soundfile Pillow tqdm requests")
    sys.exit(1)

# Dataset directories
BASE_DIR = Path(__file__).parent
AUDIO_DIR = BASE_DIR / "datasets" / "audio"
IMAGE_DIR = BASE_DIR / "datasets" / "images"

# Audio parameters (matching project requirements)
SAMPLE_RATE = 22050
DURATION = 3  # seconds

# Image parameters (matching MobileNet requirements)
IMAGE_SIZE = (224, 224)


def ensure_directories():
    """Create dataset directories if they don't exist."""
    for category in ['animal', 'human', 'gunshot']:
        (AUDIO_DIR / category).mkdir(parents=True, exist_ok=True)
    for category in ['animal', 'human']:
        (IMAGE_DIR / category).mkdir(parents=True, exist_ok=True)
    print("✓ Dataset directories verified")


def count_existing_files():
    """Count existing files in each category."""
    counts = {
        'audio': {},
        'images': {}
    }
    
    for category in ['animal', 'human', 'gunshot']:
        path = AUDIO_DIR / category
        if path.exists():
            counts['audio'][category] = len([f for f in path.iterdir() 
                                             if f.suffix.lower() in ['.wav', '.mp3', '.flac']])
        else:
            counts['audio'][category] = 0
    
    for category in ['animal', 'human']:
        path = IMAGE_DIR / category
        if path.exists():
            counts['images'][category] = len([f for f in path.iterdir() 
                                              if f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp']])
        else:
            counts['images'][category] = 0
    
    return counts


def generate_synthetic_audio(category: str, count: int):
    """
    Generate synthetic audio files for testing/development.
    These simulate different sound patterns for each category.
    """
    output_dir = AUDIO_DIR / category
    output_dir.mkdir(parents=True, exist_ok=True)
    
    existing_count = len(list(output_dir.glob("*.wav")))
    
    print(f"\nGenerating {count} synthetic {category} audio files...")
    
    for i in tqdm(range(count), desc=f"Creating {category} audio"):
        filename = f"synthetic_{category}_{existing_count + i + 1:04d}.wav"
        filepath = output_dir / filename
        
        if filepath.exists():
            continue
        
        # Generate different patterns based on category
        t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), dtype=np.float32)
        
        if category == 'animal':
            # Animal sounds: combination of varying frequencies (bird chirps, animal calls)
            freq1 = random.uniform(800, 2000)
            freq2 = random.uniform(1500, 4000)
            modulation = np.sin(2 * np.pi * random.uniform(2, 8) * t)
            audio = 0.3 * np.sin(2 * np.pi * freq1 * t) * (1 + 0.5 * modulation)
            audio += 0.2 * np.sin(2 * np.pi * freq2 * t) * np.exp(-t / random.uniform(0.5, 2))
            # Add some noise
            audio += 0.05 * np.random.randn(len(t)).astype(np.float32)
            
        elif category == 'human':
            # Human sounds: speech-like patterns (100-300 Hz fundamental with harmonics)
            fundamental = random.uniform(100, 300)
            audio = np.zeros(len(t), dtype=np.float32)
            for harmonic in range(1, 6):
                amp = 0.3 / harmonic
                audio += amp * np.sin(2 * np.pi * fundamental * harmonic * t)
            # Add envelope for speech-like pattern
            envelope = np.abs(np.sin(2 * np.pi * random.uniform(2, 5) * t))
            audio *= envelope
            audio += 0.02 * np.random.randn(len(t)).astype(np.float32)
            
        elif category == 'gunshot':
            # Gunshot: sharp impulse with decay
            impulse_time = random.uniform(0.1, 0.5)
            impulse_idx = int(impulse_time * SAMPLE_RATE)
            
            audio = np.zeros(len(t), dtype=np.float32)
            # Sharp attack
            if impulse_idx < len(audio):
                decay_length = len(audio) - impulse_idx
                decay = np.exp(-np.linspace(0, 10, decay_length))
                # Broadband noise burst
                noise_burst = np.random.randn(decay_length).astype(np.float32)
                audio[impulse_idx:] = noise_burst * decay
            
            # Add low frequency thump
            audio += 0.5 * np.exp(-20 * np.abs(t - impulse_time)) * np.sin(2 * np.pi * 50 * t)
            
            # Add echo/reverb effect
            echo_delay = int(0.3 * SAMPLE_RATE)
            if echo_delay < len(audio):
                echo = np.zeros_like(audio)
                echo[echo_delay:] = 0.3 * audio[:-echo_delay]
                audio += echo
        
        # Normalize
        audio = audio / (np.max(np.abs(audio)) + 1e-8) * 0.8
        
        # Save as WAV
        sf.write(str(filepath), audio, SAMPLE_RATE)
    
    print(f"✓ Created {count} synthetic {category} audio files in {output_dir}")


def generate_synthetic_images(category: str, count: int):
    """
    Generate synthetic placeholder images for testing/development.
    Creates images with patterns that simulate the category.
    """
    output_dir = IMAGE_DIR / category
    output_dir.mkdir(parents=True, exist_ok=True)
    
    existing_count = len(list(output_dir.glob("*.jpg")))
    
    print(f"\nGenerating {count} synthetic {category} images...")
    
    for i in tqdm(range(count), desc=f"Creating {category} images"):
        filename = f"synthetic_{category}_{existing_count + i + 1:04d}.jpg"
        filepath = output_dir / filename
        
        if filepath.exists():
            continue
        
        # Create image array
        img_array = np.zeros((IMAGE_SIZE[0], IMAGE_SIZE[1], 3), dtype=np.uint8)
        
        if category == 'animal':
            # Forest/wildlife background with random shapes (simulating animals)
            # Green-brown background
            img_array[:, :, 0] = random.randint(20, 60)   # R
            img_array[:, :, 1] = random.randint(60, 120)  # G
            img_array[:, :, 2] = random.randint(20, 50)   # B
            
            # Add random "animal-like" shapes
            for _ in range(random.randint(1, 3)):
                cx, cy = random.randint(50, 174), random.randint(50, 174)
                radius = random.randint(20, 50)
                color = (random.randint(80, 150), random.randint(60, 100), random.randint(40, 80))
                
                y, x = np.ogrid[:IMAGE_SIZE[0], :IMAGE_SIZE[1]]
                mask = (x - cx)**2 + (y - cy)**2 <= radius**2
                img_array[mask] = color
                
        elif category == 'human':
            # Outdoor background with human-like silhouette
            # Natural background
            img_array[:, :, 0] = random.randint(100, 150)
            img_array[:, :, 1] = random.randint(120, 160)
            img_array[:, :, 2] = random.randint(80, 120)
            
            # Add human-like figure (simple silhouette)
            cx = IMAGE_SIZE[1] // 2 + random.randint(-30, 30)
            
            # Head
            head_y, head_x = IMAGE_SIZE[0] // 4, cx
            y, x = np.ogrid[:IMAGE_SIZE[0], :IMAGE_SIZE[1]]
            head_mask = (x - head_x)**2 + (y - head_y)**2 <= 20**2
            
            # Body (rectangle)
            body_top = IMAGE_SIZE[0] // 4 + 20
            body_bottom = IMAGE_SIZE[0] - 30
            body_left = cx - 25
            body_right = cx + 25
            body_mask = (y >= body_top) & (y <= body_bottom) & (x >= body_left) & (x <= body_right)
            
            # Apply dark color for silhouette
            silhouette_color = (random.randint(40, 80), random.randint(40, 80), random.randint(40, 80))
            img_array[head_mask | body_mask] = silhouette_color
        
        # Add some noise for realism
        noise = np.random.randint(-10, 10, img_array.shape, dtype=np.int16)
        img_array = np.clip(img_array.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        
        # Save image
        img = Image.fromarray(img_array, mode='RGB')
        img.save(str(filepath), 'JPEG', quality=90)
    
    print(f"✓ Created {count} synthetic {category} images in {output_dir}")


def download_esc50_dataset():
    """
    Download and extract ESC-50 dataset for animal and human sounds.
    ESC-50 contains 2000 environmental audio recordings in 50 categories.
    """
    esc50_url = "https://github.com/karoldvl/ESC-50/archive/master.zip"
    
    print("\n" + "="*60)
    print("ESC-50 Dataset Download")
    print("="*60)
    print("""
The ESC-50 dataset contains 2000 labeled audio recordings.
Relevant categories for WildGuard:
    
    Animal sounds: dog, cat, rooster, pig, cow, frog, birds, insects, etc.
    Human sounds: crying_baby, sneezing, clapping, breathing, coughing, footsteps
    
Download manually from:
    https://github.com/karoldvl/ESC-50
    
Or use this direct link:
    https://github.com/karoldvl/ESC-50/archive/master.zip
    
After downloading:
1. Extract the zip file
2. Navigate to ESC-50-master/audio/
3. Copy relevant files based on the ESC-50 metadata:
   - Animal sounds (categories 0-9): dog, rooster, pig, cow, frog, cat, etc.
   - Human sounds (categories 35-39): footsteps, laughing, brushing teeth, snoring, etc.
""")
    
    try:
        response = input("Attempt automatic download? (y/n): ").strip().lower()
        if response == 'y':
            print("Downloading ESC-50 dataset (approximately 600MB)...")
            response = requests.get(esc50_url, stream=True, timeout=30)
            
            if response.status_code == 200:
                total_size = int(response.headers.get('content-length', 0))
                
                temp_zip = BASE_DIR / "esc50_temp.zip"
                with open(temp_zip, 'wb') as f:
                    for chunk in tqdm(response.iter_content(chunk_size=8192), 
                                     total=total_size//8192, 
                                     desc="Downloading"):
                        f.write(chunk)
                
                print("Extracting...")
                with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
                    zip_ref.extractall(BASE_DIR / "esc50_temp")
                
                print("✓ ESC-50 downloaded and extracted")
                print(f"  Files located at: {BASE_DIR / 'esc50_temp'}")
                print("  Please manually copy the relevant files to the dataset folders")
                
                temp_zip.unlink()
            else:
                print(f"✗ Download failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Automatic download failed: {e}")
        print("  Please download manually from the URLs above")


def download_freesound_samples(category: str, api_key: str, count: int):
    """
    Download audio samples from Freesound.org using their API.
    Requires a free API key from https://freesound.org/apiv2/apply/
    """
    if not api_key:
        print("\n" + "="*60)
        print("Freesound.org API")
        print("="*60)
        print("""
To download from Freesound.org:
1. Create a free account at https://freesound.org/
2. Get an API key at https://freesound.org/apiv2/apply/
3. Run this script with: --method freesound --api-key YOUR_KEY

Search queries for each category:
    - animal: "bird call", "elephant", "lion roar", "wildlife"
    - human: "footsteps outdoor", "speech forest", "human activity"
    - gunshot: "gunshot", "rifle shot", "hunting shot"
""")
        return
    
    search_queries = {
        'animal': ['bird call', 'elephant trumpet', 'lion roar', 'wolf howl', 'monkey'],
        'human': ['footsteps forest', 'human speech outdoor', 'coughing', 'breathing heavy'],
        'gunshot': ['gunshot', 'rifle shot', 'pistol shot', 'hunting shot']
    }
    
    queries = search_queries.get(category, [category])
    
    print(f"\nSearching Freesound for {category} sounds...")
    
    downloaded = 0
    output_dir = AUDIO_DIR / category
    
    for query in queries:
        if downloaded >= count:
            break
            
        try:
            search_url = "https://freesound.org/apiv2/search/text/"
            params = {
                'query': query,
                'token': api_key,
                'fields': 'id,name,previews',
                'filter': 'duration:[1 TO 10]',
                'page_size': min(count - downloaded, 15)
            }
            
            response = requests.get(search_url, params=params, timeout=30)
            
            if response.status_code == 200:
                results = response.json().get('results', [])
                
                for sound in results:
                    if downloaded >= count:
                        break
                    
                    preview_url = sound.get('previews', {}).get('preview-hq-mp3')
                    if preview_url:
                        audio_response = requests.get(preview_url, timeout=30)
                        if audio_response.status_code == 200:
                            filename = f"freesound_{category}_{sound['id']}.mp3"
                            filepath = output_dir / filename
                            
                            with open(filepath, 'wb') as f:
                                f.write(audio_response.content)
                            
                            downloaded += 1
                            print(f"  ✓ Downloaded: {filename}")
            else:
                print(f"  ✗ Search failed for '{query}': HTTP {response.status_code}")
                
        except Exception as e:
            print(f"  ✗ Error searching for '{query}': {e}")
    
    print(f"\n✓ Downloaded {downloaded} files to {output_dir}")


def download_sample_images(category: str, count: int):
    """
    Provide instructions for downloading images from open datasets.
    """
    print("\n" + "="*60)
    print(f"Image Dataset Sources for '{category}'")
    print("="*60)
    
    if category == 'human':
        print("""
Recommended sources for human images:

1. COCO Dataset (Recommended)
   - URL: https://cocodataset.org/#download
   - Use the 2017 Val images (~1GB) and filter for 'person' category
   - Python download:
     pip install pycocotools
     from pycocotools.coco import COCO
     coco = COCO('annotations/instances_val2017.json')
     person_ids = coco.getImgIds(catIds=coco.getCatIds(catNms=['person']))

2. Open Images Dataset
   - URL: https://storage.googleapis.com/openimages/web/index.html
   - Use OIDv4 toolkit: pip install openimages
   - Command: oid_download_dataset --type_data validation --classes Person --limit 100

3. INRIA Person Dataset
   - URL: http://pascal.inrialpes.fr/data/human/
   - Direct download of labeled pedestrian images
   - ~300 positive samples with annotations

4. Kaggle Human Detection Dataset
   - URL: https://www.kaggle.com/datasets/constantinwerner/human-detection-dataset
   - Requires Kaggle account (free)
   - Use: kaggle datasets download -d constantinwerner/human-detection-dataset

5. Penn-Fudan Pedestrian Database
   - URL: https://www.cis.upenn.edu/~jshi/ped_html/
   - 170 images with 345 labeled pedestrians
""")
    
    elif category == 'animal':
        print("""
Recommended sources for animal/wildlife images:

1. iNaturalist Dataset
   - URL: https://github.com/visipedia/inat_comp
   - Large collection of wildlife images with species labels

2. Snapshot Serengeti
   - URL: https://lila.science/datasets/snapshot-serengeti
   - Camera trap images from African wildlife

3. Caltech-UCSD Birds 200
   - URL: http://www.vision.caltech.edu/visipedia/CUB-200.html
   - 11,788 bird images

4. Stanford Dogs Dataset
   - URL: http://vision.stanford.edu/aditya86/ImageNetDogs/
   - 20,580 images of dogs
""")


def print_status():
    """Print current dataset status."""
    counts = count_existing_files()
    
    requirements = {
        'audio': {'animal': 50, 'human': 50, 'gunshot': 50},
        'images': {'animal': 100, 'human': 100}
    }
    
    print("\n" + "="*60)
    print("Dataset Status")
    print("="*60)
    
    print("\nAudio Files:")
    for category in ['animal', 'human', 'gunshot']:
        current = counts['audio'][category]
        required = requirements['audio'][category]
        needed = max(0, required - current)
        status = "✓" if current >= required else "✗"
        print(f"  {status} {category}: {current}/{required} files (need {needed} more)")
    
    print("\nImage Files:")
    for category in ['animal', 'human']:
        current = counts['images'][category]
        required = requirements['images'][category]
        needed = max(0, required - current)
        status = "✓" if current >= required else "✗"
        print(f"  {status} {category}: {current}/{required} files (need {needed} more)")
    
    return counts


def main():
    parser = argparse.ArgumentParser(
        description="WildGuard Dataset Acquisition Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Show current dataset status
    python download_datasets.py --status
    
    # Generate synthetic files for all categories (for development/testing)
    python download_datasets.py --method synthetic --all
    
    # Generate specific synthetic files
    python download_datasets.py --method synthetic --category audio/gunshot --count 30
    
    # Download ESC-50 dataset
    python download_datasets.py --method esc50
    
    # Download from Freesound (requires API key)
    python download_datasets.py --method freesound --category audio/animal --api-key YOUR_KEY
        """
    )
    
    parser.add_argument('--status', action='store_true',
                       help='Show current dataset status')
    parser.add_argument('--method', choices=['synthetic', 'esc50', 'freesound', 'info'],
                       help='Method to acquire data')
    parser.add_argument('--category', type=str,
                       help='Category to populate (e.g., audio/animal, images/human)')
    parser.add_argument('--count', type=int, default=0,
                       help='Number of files to generate/download')
    parser.add_argument('--api-key', type=str,
                       help='API key for Freesound.org')
    parser.add_argument('--all', action='store_true',
                       help='Process all categories that need more files')
    
    args = parser.parse_args()
    
    ensure_directories()
    
    if args.status or not any([args.method, args.all]):
        counts = print_status()
        
        if not args.method:
            print("\n" + "-"*60)
            print("Quick Start Commands:")
            print("-"*60)
            print("\n# Generate synthetic files for development:")
            print("python download_datasets.py --method synthetic --all")
            print("\n# Show dataset source information:")
            print("python download_datasets.py --method info")
        return
    
    if args.method == 'info':
        download_esc50_dataset()
        download_sample_images('human', 0)
        download_sample_images('animal', 0)
        return
    
    if args.method == 'synthetic':
        if args.all:
            counts = count_existing_files()
            requirements = {
                'audio': {'animal': 50, 'human': 50, 'gunshot': 50},
                'images': {'animal': 100, 'human': 100}
            }
            
            # Generate needed audio files
            for category in ['animal', 'human', 'gunshot']:
                needed = requirements['audio'][category] - counts['audio'][category]
                if needed > 0:
                    generate_synthetic_audio(category, needed)
            
            # Generate needed image files
            for category in ['animal', 'human']:
                needed = requirements['images'][category] - counts['images'][category]
                if needed > 0:
                    generate_synthetic_images(category, needed)
            
            print("\n" + "="*60)
            print("Synthetic Data Generation Complete!")
            print_status()
            
        elif args.category:
            parts = args.category.split('/')
            if len(parts) == 2:
                data_type, category = parts
                count = args.count if args.count > 0 else 10
                
                if data_type == 'audio' and category in ['animal', 'human', 'gunshot']:
                    generate_synthetic_audio(category, count)
                elif data_type == 'images' and category in ['animal', 'human']:
                    generate_synthetic_images(category, count)
                else:
                    print(f"Invalid category: {args.category}")
            else:
                print("Category format: audio/animal, audio/human, audio/gunshot, images/animal, images/human")
        else:
            print("Please specify --all or --category")
    
    elif args.method == 'esc50':
        download_esc50_dataset()
    
    elif args.method == 'freesound':
        if args.category:
            parts = args.category.split('/')
            if len(parts) == 2 and parts[0] == 'audio':
                count = args.count if args.count > 0 else 10
                download_freesound_samples(parts[1], args.api_key, count)
            else:
                print("Freesound only supports audio categories")
        else:
            print("Please specify an audio category with --category audio/TYPE")


if __name__ == '__main__':
    main()
