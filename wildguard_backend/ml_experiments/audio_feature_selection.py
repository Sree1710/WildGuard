"""
AUDIO FEATURE SELECTION
=======================
This module performs feature selection to identify the most relevant features
for audio-based wildlife and poaching detection.

Feature Selection Methods:
1. Variance Threshold
   - Remove features with low variance (little information)
   
2. Correlation Analysis
   - Identify and remove highly correlated features (redundancy)
   
3. Random Forest Feature Importance
   - Measure each feature's contribution to model performance

Academic Purpose:
Identifies key features that maximize model performance while minimizing dimensionality.
This reduces computational cost and improves generalization.
"""

import numpy as np
import json
from datetime import datetime
from collections import defaultdict

# ============================================================================
# MOCK FEATURE SELECTION METHODS
# ============================================================================

class VarianceThreshold:
    """
    Remove features with variance below a threshold.
    
    Rationale:
    Features with very low variance contain little information
    and can be safely removed without losing predictive power.
    """
    
    def __init__(self, threshold=0.01):
        """
        Parameters:
        -----------
        threshold : float
            Minimum variance threshold (default: 0.01)
        """
        self.threshold = threshold
        self.feature_variances = None
        self.selected_features = None
    
    def fit(self, X):
        """
        Calculate variance for each feature.
        
        Parameters:
        -----------
        X : ndarray
            Feature matrix (n_samples, n_features)
        """
        self.feature_variances = np.var(X, axis=0)
        self.selected_features = np.where(self.feature_variances >= self.threshold)[0]
        
    def get_selected_features(self):
        """Return indices of selected features"""
        return self.selected_features
    
    def report(self, feature_names):
        """Generate variance report"""
        report = {
            "method": "Variance Threshold",
            "threshold": self.threshold,
            "initial_features": len(self.feature_variances),
            "selected_features": len(self.selected_features),
            "removed_features": len(self.feature_variances) - len(self.selected_features),
            "feature_details": []
        }
        
        for i, variance in enumerate(self.feature_variances):
            status = "✓ Selected" if i in self.selected_features else "✗ Removed"
            report["feature_details"].append({
                "feature_name": feature_names[i],
                "variance": round(float(variance), 6),
                "status": status
            })
        
        return report


class CorrelationAnalysis:
    """
    Remove highly correlated features to reduce redundancy.
    
    Rationale:
    Highly correlated features provide similar information.
    Keeping only one representative feature reduces dimensionality
    without losing predictive information.
    """
    
    def __init__(self, correlation_threshold=0.95):
        """
        Parameters:
        -----------
        correlation_threshold : float
            Maximum correlation allowed between features (default: 0.95)
        """
        self.correlation_threshold = correlation_threshold
        self.correlation_matrix = None
        self.selected_features = None
        self.correlations = []
    
    def fit(self, X):
        """
        Calculate correlation matrix and identify redundant features.
        
        Parameters:
        -----------
        X : ndarray
            Feature matrix (n_samples, n_features)
        """
        self.correlation_matrix = np.corrcoef(X.T)
        self.selected_features = set(range(X.shape[1]))
        
        # Find highly correlated feature pairs
        n_features = X.shape[1]
        for i in range(n_features):
            for j in range(i + 1, n_features):
                correlation = abs(self.correlation_matrix[i, j])
                if correlation >= self.correlation_threshold:
                    # Remove the second feature to keep first
                    if j in self.selected_features:
                        self.selected_features.discard(j)
                        self.correlations.append((i, j, float(correlation)))
        
        self.selected_features = sorted(list(self.selected_features))
    
    def report(self, feature_names):
        """Generate correlation analysis report"""
        report = {
            "method": "Correlation Analysis",
            "correlation_threshold": self.correlation_threshold,
            "initial_features": len(feature_names),
            "selected_features": len(self.selected_features),
            "highly_correlated_pairs": []
        }
        
        for feat1_idx, feat2_idx, corr in self.correlations:
            report["highly_correlated_pairs"].append({
                "feature1": feature_names[feat1_idx],
                "feature2": feature_names[feat2_idx],
                "correlation": round(float(corr), 4),
                "action": f"Removed {feature_names[feat2_idx]}"
            })
        
        return report


class RandomForestFeatureImportance:
    """
    Use Random Forest model to measure feature importance.
    
    Rationale:
    Features that contribute more to tree splits have higher importance.
    This is model-aware feature selection that considers predictive power.
    
    Academic Note:
    This measures "Gini importance" or "impurity-based importance".
    """
    
    def __init__(self, n_trees=100):
        """
        Parameters:
        -----------
        n_trees : int
            Number of trees in Random Forest (default: 100)
        """
        self.n_trees = n_trees
        self.feature_importances = None
    
    def fit(self, X, y):
        """
        Calculate feature importances using mock Random Forest.
        
        Parameters:
        -----------
        X : ndarray
            Feature matrix (n_samples, n_features)
        y : ndarray
            Labels (n_samples,)
        """
        n_features = X.shape[1]
        
        # Mock feature importances (in reality, trained RF provides these)
        # Features with higher impact on class separation get higher importance
        self.feature_importances = np.random.uniform(0.01, 0.1, n_features)
        
        # Normalize to sum to 1
        self.feature_importances = self.feature_importances / np.sum(self.feature_importances)
    
    def get_top_features(self, n_top=20):
        """
        Get indices of top N most important features.
        
        Parameters:
        -----------
        n_top : int
            Number of top features to select
            
        Returns:
        --------
        top_indices : ndarray
            Indices of top features sorted by importance
        """
        return np.argsort(self.feature_importances)[::-1][:n_top]
    
    def report(self, feature_names, n_top=20):
        """Generate feature importance report"""
        top_indices = self.get_top_features(n_top)
        
        report = {
            "method": "Random Forest Feature Importance",
            "n_trees": self.n_trees,
            "total_features": len(feature_names),
            "top_features_selected": n_top,
            "feature_importances": []
        }
        
        for idx in range(len(feature_names)):
            importance = float(self.feature_importances[idx])
            rank = np.where(top_indices == idx)[0]
            status = f"Top {rank[0]+1}" if len(rank) > 0 else "Not selected"
            
            report["feature_importances"].append({
                "feature_name": feature_names[idx],
                "importance_score": round(importance, 6),
                "percentile": round(float((idx in top_indices) * 100), 1),
                "status": status
            })
        
        return report


# ============================================================================
# INTEGRATED FEATURE SELECTION PIPELINE
# ============================================================================

class FeatureSelectionPipeline:
    """
    Combine multiple feature selection methods for robust feature selection.
    """
    
    def __init__(self, feature_names):
        """
        Parameters:
        -----------
        feature_names : list
            Names of all features
        """
        self.feature_names = feature_names
        self.n_initial_features = len(feature_names)
        self.results = {}
        self.final_selected_features = None
    
    def run_pipeline(self, X, y):
        """
        Run all feature selection methods.
        
        Parameters:
        -----------
        X : ndarray
            Feature matrix (n_samples, n_features)
        y : ndarray
            Labels (n_samples,)
        """
        print("\n" + "="*70)
        print("FEATURE SELECTION PIPELINE")
        print("="*70)
        
        # Method 1: Variance Threshold
        print("\n[1/3] Running Variance Threshold...")
        vt = VarianceThreshold(threshold=0.001)
        vt.fit(X)
        self.results["variance_threshold"] = vt.report(self.feature_names)
        variance_selected = set(vt.get_selected_features())
        print(f"  ✓ {len(variance_selected)} features selected (removed {self.n_initial_features - len(variance_selected)})")
        
        # Method 2: Correlation Analysis
        print("\n[2/3] Running Correlation Analysis...")
        corr = CorrelationAnalysis(correlation_threshold=0.9)
        corr.fit(X)
        self.results["correlation_analysis"] = corr.report(self.feature_names)
        correlation_selected = set(corr.selected_features)
        print(f"  ✓ {len(correlation_selected)} features selected (removed {self.n_initial_features - len(correlation_selected)})")
        
        # Method 3: Random Forest Feature Importance
        print("\n[3/3] Running Random Forest Feature Importance...")
        rf_importance = RandomForestFeatureImportance(n_trees=100)
        rf_importance.fit(X, y)
        self.results["random_forest"] = rf_importance.report(self.feature_names, n_top=20)
        rf_top_features = set(rf_importance.get_top_features(n_top=20))
        print(f"  ✓ Top 20 features selected by Random Forest")
        
        # Combine results: intersection of all methods
        print("\n" + "="*70)
        print("COMBINING FEATURE SELECTION RESULTS")
        print("="*70)
        
        # Use intersection: features selected by all methods
        combined_selected = variance_selected & correlation_selected & rf_top_features
        
        # If intersection is too small, use union of top performers
        if len(combined_selected) < 10:
            combined_selected = variance_selected & correlation_selected
        
        self.final_selected_features = sorted(list(combined_selected))
        
        print(f"\nVariance Threshold selected: {len(variance_selected)}")
        print(f"Correlation Analysis selected: {len(correlation_selected)}")
        print(f"Random Forest selected: {len(rf_top_features)}")
        print(f"\n✓ Final selected features: {len(self.final_selected_features)}")
        print(f"  Dimensionality reduction: {self.n_initial_features} → {len(self.final_selected_features)}")
        
        return self.final_selected_features
    
    def get_selected_feature_names(self):
        """Return names of selected features"""
        return [self.feature_names[i] for i in self.final_selected_features]
    
    def generate_summary(self):
        """Generate comprehensive feature selection summary"""
        summary = {
            "timestamp": datetime.now().isoformat(),
            "initial_feature_count": self.n_initial_features,
            "final_feature_count": len(self.final_selected_features),
            "dimensionality_reduction_percent": round(
                (1 - len(self.final_selected_features) / self.n_initial_features) * 100, 2
            ),
            "selected_features": self.get_selected_feature_names(),
            "selection_methods": self.results
        }
        
        return summary


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    """
    Perform feature selection on audio dataset.
    """
    # Import dataset (from audio_feature_extraction.py)
    from audio_feature_extraction import AudioDatasetGenerator
    
    print("\n" + "="*70)
    print("AUDIO FEATURE SELECTION - COMPLETE PIPELINE")
    print("="*70)
    
    # Generate synthetic dataset
    print("\nGenerating synthetic audio dataset...")
    dataset = AudioDatasetGenerator.generate_labeled_dataset(num_samples_per_class=50)
    
    X = dataset["features"]
    y = dataset["labels"]
    feature_names = dataset["feature_names"]
    
    print(f"✓ Dataset shape: {X.shape}")
    print(f"✓ Classes: {len(dataset['class_names'])}")
    
    # Run feature selection pipeline
    pipeline = FeatureSelectionPipeline(feature_names)
    selected_indices = pipeline.run_pipeline(X, y)
    
    # Display selected features
    print("\n" + "="*70)
    print("SELECTED FEATURES FOR MODEL TRAINING")
    print("="*70)
    
    selected_names = pipeline.get_selected_feature_names()
    print(f"\nTotal selected features: {len(selected_names)}\n")
    for i, feature in enumerate(selected_names, 1):
        print(f"  {i:2d}. {feature}")
    
    # Save results
    summary = pipeline.generate_summary()
    
    with open("feature_selection_results.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n✅ Feature selection results saved to feature_selection_results.json")
