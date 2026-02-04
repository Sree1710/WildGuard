"""
Download Real Images for WildGuard Training
============================================
This script downloads real images from open datasets to improve model accuracy.

Sources:
1. Pexels API (Free, no attribution required for most images)
2. Unsplash API (Free with attribution)
3. Direct URLs from open wildlife datasets

Usage:
    python download_real_images.py --category human --count 50
    python download_real_images.py --category animal --count 50
    python download_real_images.py --all
"""

import os
import sys
import argparse
import requests
import time
import hashlib
from pathlib import Path
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from PIL import Image
    from tqdm import tqdm
except ImportError:
    print("Install required packages: pip install Pillow tqdm requests")
    sys.exit(1)

# Paths
BASE_DIR = Path(__file__).parent
IMAGE_DIR = BASE_DIR / "datasets" / "images"

# Image settings (MobileNet input size)
TARGET_SIZE = (224, 224)

# Pexels API - Free tier allows 200 requests/hour
# Get your free API key at: https://www.pexels.com/api/
PEXELS_API_KEY = ""  # Add your key here or use --api-key argument

# Search queries for each category
SEARCH_QUERIES = {
    'human': [
        'person hiking forest',
        'man walking outdoors',
        'woman nature trail',
        'hiker mountain',
        'person camping',
        'tourist wildlife',
        'ranger forest',
        'people outdoor adventure',
        'backpacker trail',
        'person standing forest'
    ],
    'animal': [
        'elephant wildlife',
        'lion safari',
        'zebra africa',
        'giraffe savanna',
        'deer forest',
        'bear wildlife',
        'wolf nature',
        'tiger wildlife',
        'rhino safari',
        'buffalo wildlife',
        'antelope africa',
        'leopard wildlife',
        'bird wildlife',
        'eagle nature'
    ]
}

# Direct image URLs from open sources (CC0/Public Domain)
# These are sample URLs - in production, use API calls
SAMPLE_URLS = {
    'human': [
        # Placeholder - will be populated by API calls
    ],
    'animal': [
        # Wildlife images from open sources
    ]
}


def ensure_directories():
    """Create dataset directories."""
    for category in ['animal', 'human']:
        (IMAGE_DIR / category).mkdir(parents=True, exist_ok=True)
    print("✓ Directories verified")


def count_existing_files(category: str) -> int:
    """Count existing files in category."""
    path = IMAGE_DIR / category
    if path.exists():
        return len([f for f in path.iterdir() 
                   if f.suffix.lower() in ['.jpg', '.jpeg', '.png']])
    return 0


def download_and_save_image(url: str, filepath: Path) -> bool:
    """Download image from URL and save to filepath."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            # Open and resize image
            img = Image.open(BytesIO(response.content))
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize to target size
            img = img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
            
            # Save as JPEG
            img.save(str(filepath), 'JPEG', quality=90)
            return True
    except Exception as e:
        pass
    return False


def download_from_pexels(category: str, count: int, api_key: str):
    """Download images from Pexels API."""
    if not api_key:
        print("\n⚠️  Pexels API Key Required")
        print("="*60)
        print("""
To download from Pexels (free, high-quality images):

1. Go to https://www.pexels.com/api/
2. Create a free account
3. Get your API key
4. Run: python download_real_images.py --category human --api-key YOUR_KEY

Pexels offers:
✓ Free API access (200 requests/hour)
✓ High-quality images
✓ No attribution required for most uses
✓ Wildlife and human images available
""")
        return 0
    
    output_dir = IMAGE_DIR / category
    queries = SEARCH_QUERIES.get(category, [category])
    
    downloaded = 0
    existing = count_existing_files(category)
    
    headers = {
        'Authorization': api_key
    }
    
    print(f"\n📥 Downloading {category} images from Pexels...")
    
    for query in queries:
        if downloaded >= count:
            break
        
        try:
            # Pexels API endpoint
            url = "https://api.pexels.com/v1/search"
            params = {
                'query': query,
                'per_page': min(15, count - downloaded),
                'size': 'medium'
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                photos = data.get('photos', [])
                
                for photo in photos:
                    if downloaded >= count:
                        break
                    
                    # Get medium size image URL
                    img_url = photo.get('src', {}).get('medium')
                    if not img_url:
                        continue
                    
                    # Generate unique filename
                    photo_id = photo.get('id', hashlib.md5(img_url.encode()).hexdigest()[:8])
                    filename = f"pexels_{category}_{photo_id}.jpg"
                    filepath = output_dir / filename
                    
                    if filepath.exists():
                        continue
                    
                    if download_and_save_image(img_url, filepath):
                        downloaded += 1
                        print(f"  ✓ [{downloaded}/{count}] {filename}")
                
                # Rate limiting - be nice to the API
                time.sleep(0.5)
                
            elif response.status_code == 401:
                print("  ✗ Invalid API key")
                return downloaded
            else:
                print(f"  ✗ API error: {response.status_code}")
                
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    print(f"\n✓ Downloaded {downloaded} {category} images")
    return downloaded


def download_from_urls(category: str, urls: list):
    """Download images from direct URLs."""
    output_dir = IMAGE_DIR / category
    downloaded = 0
    
    print(f"\n📥 Downloading {category} images from URLs...")
    
    for i, url in enumerate(tqdm(urls, desc=f"Downloading {category}")):
        filename = f"url_{category}_{i+1:04d}.jpg"
        filepath = output_dir / filename
        
        if filepath.exists():
            continue
        
        if download_and_save_image(url, filepath):
            downloaded += 1
    
    print(f"✓ Downloaded {downloaded} images")
    return downloaded


def download_kaggle_instructions():
    """Print instructions for downloading from Kaggle."""
    print("""
╔══════════════════════════════════════════════════════════════╗
║           KAGGLE DATASET DOWNLOAD INSTRUCTIONS               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  For Human Images:                                           ║
║  -----------------                                           ║
║  Dataset: Human Detection Dataset                            ║
║  URL: kaggle.com/datasets/constantinwerner/human-detection   ║
║                                                              ║
║  Commands:                                                   ║
║  1. pip install kaggle                                       ║
║  2. Create ~/.kaggle/kaggle.json with your API token         ║
║  3. kaggle datasets download constantinwerner/human-detection║
║  4. Extract and copy images to datasets/images/human/        ║
║                                                              ║
║  For Animal/Wildlife Images:                                 ║
║  ---------------------------                                 ║
║  Dataset: Animals-10                                         ║
║  URL: kaggle.com/datasets/alessiocorrado99/animals10         ║
║                                                              ║
║  Dataset: African Wildlife                                   ║
║  URL: kaggle.com/datasets/biancaferreira/african-wildlife    ║
║                                                              ║
║  Commands:                                                   ║
║  1. kaggle datasets download alessiocorrado99/animals10      ║
║  2. Extract and copy images to datasets/images/animal/       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")


def download_coco_instructions():
    """Print instructions for COCO dataset."""
    print("""
╔══════════════════════════════════════════════════════════════╗
║              COCO DATASET DOWNLOAD INSTRUCTIONS              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  COCO (Common Objects in Context) is one of the best        ║
║  datasets for human detection with 80+ object categories.   ║
║                                                              ║
║  Quick Download (Validation Set - 1GB):                      ║
║  --------------------------------------                      ║
║  1. Download val2017.zip from:                               ║
║     http://images.cocodataset.org/zips/val2017.zip          ║
║                                                              ║
║  2. Download annotations:                                    ║
║     http://images.cocodataset.org/annotations/              ║
║     annotations_trainval2017.zip                             ║
║                                                              ║
║  Python Script to Extract Person Images:                     ║
║  ----------------------------------------                    ║
║  from pycocotools.coco import COCO                           ║
║  import shutil                                               ║
║                                                              ║
║  coco = COCO('annotations/instances_val2017.json')          ║
║  person_cat_id = coco.getCatIds(catNms=['person'])[0]       ║
║  person_img_ids = coco.getImgIds(catIds=[person_cat_id])    ║
║                                                              ║
║  for img_id in person_img_ids[:100]:                        ║
║      img_info = coco.loadImgs(img_id)[0]                    ║
║      src = f"val2017/{img_info['file_name']}"               ║
║      dst = f"datasets/images/human/{img_info['file_name']}" ║
║      shutil.copy(src, dst)                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")


def replace_synthetic_images(category: str):
    """Remove synthetic images to make room for real ones."""
    output_dir = IMAGE_DIR / category
    removed = 0
    
    for f in output_dir.iterdir():
        if f.name.startswith('synthetic_'):
            f.unlink()
            removed += 1
    
    if removed > 0:
        print(f"✓ Removed {removed} synthetic {category} images")
    
    return removed


def print_status():
    """Print current image dataset status."""
    print("\n" + "="*60)
    print("IMAGE DATASET STATUS")
    print("="*60)
    
    for category in ['animal', 'human']:
        path = IMAGE_DIR / category
        if path.exists():
            total = 0
            synthetic = 0
            real = 0
            
            for f in path.iterdir():
                if f.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                    total += 1
                    if f.name.startswith('synthetic_'):
                        synthetic += 1
                    else:
                        real += 1
            
            print(f"\n{category.upper()}:")
            print(f"  Total: {total} images")
            print(f"  Real: {real} images")
            print(f"  Synthetic: {synthetic} images")
            
            if synthetic > 0 and real == 0:
                print(f"  ⚠️  All images are synthetic - accuracy will be low!")
            elif real > 0:
                print(f"  ✓ {real/(total)*100:.1f}% real images")


def main():
    parser = argparse.ArgumentParser(
        description="Download real images for WildGuard training",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Show current status
    python download_real_images.py --status
    
    # Download from Pexels (requires free API key)
    python download_real_images.py --category human --count 50 --api-key YOUR_KEY
    
    # Show download instructions for COCO/Kaggle
    python download_real_images.py --instructions
    
    # Remove synthetic images before downloading real ones
    python download_real_images.py --clean human
        """
    )
    
    parser.add_argument('--status', action='store_true',
                       help='Show current dataset status')
    parser.add_argument('--category', choices=['human', 'animal'],
                       help='Category to download')
    parser.add_argument('--count', type=int, default=50,
                       help='Number of images to download')
    parser.add_argument('--api-key', type=str, default=PEXELS_API_KEY,
                       help='Pexels API key')
    parser.add_argument('--instructions', action='store_true',
                       help='Show manual download instructions')
    parser.add_argument('--clean', type=str, metavar='CATEGORY',
                       help='Remove synthetic images from category')
    parser.add_argument('--all', action='store_true',
                       help='Download for all categories')
    
    args = parser.parse_args()
    
    ensure_directories()
    
    if args.status:
        print_status()
        return
    
    if args.instructions:
        download_coco_instructions()
        download_kaggle_instructions()
        return
    
    if args.clean:
        replace_synthetic_images(args.clean)
        return
    
    if args.category:
        download_from_pexels(args.category, args.count, args.api_key)
        print_status()
    elif args.all:
        for cat in ['human', 'animal']:
            download_from_pexels(cat, args.count, args.api_key)
        print_status()
    else:
        print_status()
        print("\n" + "-"*60)
        print("QUICK START - Improve Model Accuracy")
        print("-"*60)
        print("""
To improve from 67.5% to 90%+ accuracy:

1. GET A FREE PEXELS API KEY:
   → https://www.pexels.com/api/
   
2. DOWNLOAD REAL IMAGES:
   python download_real_images.py --category human --count 100 --api-key YOUR_KEY
   python download_real_images.py --category animal --count 100 --api-key YOUR_KEY

3. OPTIONALLY CLEAN SYNTHETIC IMAGES:
   python download_real_images.py --clean human
   python download_real_images.py --clean animal

4. RETRAIN THE MODEL:
   python train_image_model.py

For more options, see: python download_real_images.py --instructions
""")


if __name__ == '__main__':
    main()
