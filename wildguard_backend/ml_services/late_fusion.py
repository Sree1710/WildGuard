"""
ML SERVICES - LATE FUSION ENGINE
==================================
Late-fusion module that combines visual (image) and audio detection results
into a single, higher-confidence prediction.

Fusion Strategy:
- Weighted average of confidence scores (α=0.6 visual, β=0.4 audio)
- Corroboration boost when both modalities agree on a threat category
- Alert escalation rules for cross-modal threat correlation
- Falls back to single-modality score when only one is available

Academic Purpose:
Demonstrates decision-level (late) fusion for multimodal wildlife monitoring.
Corroboration boosting is based on the principle that agreement between
independent sensors increases prediction reliability.
"""

from datetime import datetime
from typing import Dict, Optional


class LateFusionEngine:
    """
    Late-fusion engine that combines visual and audio detection evidence.
    
    Late fusion operates at the decision level — each modality runs its own
    classifier independently, and their output scores are combined afterwards.
    
    Advantages:
    - Modality-independent: each detector can be trained/updated separately
    - Robust to missing modalities: works with image-only or audio-only input
    - Simple to implement and interpret
    
    Parameters:
    -----------
    visual_weight : float
        Weight for visual (image) confidence. Default 0.6 because YOLOv5
        generally achieves higher precision than audio classifiers.
    audio_weight : float
        Weight for audio confidence. Default 0.4.
    """
    
    # Cross-modal threat escalation rules
    # If image detects X AND audio detects Y → escalate alert level
    ESCALATION_RULES = {
        ('human', 'gunshot'): {'alert_level': 'critical', 'label': 'armed_poacher'},
        ('human', 'chainsaw'): {'alert_level': 'critical', 'label': 'illegal_logging'},
        ('human', 'vehicle'): {'alert_level': 'high', 'label': 'suspicious_vehicle'},
        ('vehicle', 'gunshot'): {'alert_level': 'critical', 'label': 'armed_vehicle'},
        ('poacher', 'gunshot'): {'alert_level': 'critical', 'label': 'confirmed_poacher'},
    }
    
    # Corroboration boost rules
    # When both modalities detect related threats, confidence is boosted
    # because independent sensor agreement increases prediction reliability.
    # Boost values are percentages (0.15 = 15% boost, capped at 1.0)
    CORROBORATION_RULES = {
        # (visual_object, audio_class) → boost_factor
        ('human', 'gunshot'): 0.15,       # Strong threat corroboration → 15% boost
        ('human', 'chainsaw'): 0.15,      # Illegal logging corroboration → 15% boost
        ('poacher', 'gunshot'): 0.15,      # Confirmed poaching → 15% boost
        ('vehicle', 'gunshot'): 0.12,      # Armed vehicle → 12% boost
        ('human', 'vehicle'): 0.10,        # Suspicious vehicle → 10% boost
        ('human', 'human_activity'): 0.10, # Human presence confirmed → 10% boost
    }
    
    def __init__(self, visual_weight: float = 0.6, audio_weight: float = 0.4,
                 enable_corroboration_boost: bool = True):
        if abs((visual_weight + audio_weight) - 1.0) > 0.01:
            raise ValueError("Weights must sum to 1.0")
        
        self.visual_weight = visual_weight
        self.audio_weight = audio_weight
        self.enable_corroboration_boost = enable_corroboration_boost
        self.fusion_method = "weighted_average_with_corroboration"
    
    def fuse(
        self,
        visual_result: Optional[Dict] = None,
        audio_result: Optional[Dict] = None
    ) -> Dict:
        """
        Combine visual and audio detection results using late fusion.
        
        Parameters:
        -----------
        visual_result : dict or None
            Image detector output. Expected keys:
            - 'confidence' (float): detection confidence 0-1
            - 'detected_object' (str): e.g. 'human', 'elephant'
        audio_result : dict or None
            Audio detector output. Expected keys:
            - 'confidence' (float): classification confidence 0-1
            - 'predicted_class' (str): e.g. 'gunshot', 'elephant'
        
        Returns:
        --------
        fused : dict
            Fused prediction with combined confidence and alert info.
        """
        if visual_result is None and audio_result is None:
            raise ValueError("At least one modality must be provided")
        
        visual_conf = visual_result.get('confidence', 0.0) if visual_result else 0.0
        audio_conf = audio_result.get('confidence', 0.0) if audio_result else 0.0
        
        visual_object = visual_result.get('detected_object', '') if visual_result else ''
        audio_class = audio_result.get('predicted_class', '') if audio_result else ''
        
        # Determine fusion type and compute fused confidence
        has_visual = visual_result is not None
        has_audio = audio_result is not None
        
        corroboration_boost = 0.0
        
        if has_visual and has_audio:
            # Full late fusion — weighted average
            fusion_confidence = (
                self.visual_weight * visual_conf +
                self.audio_weight * audio_conf
            )
            
            # Apply corroboration boost when both modalities agree on threat
            if self.enable_corroboration_boost:
                corroboration_boost = self._get_corroboration_boost(
                    visual_object, audio_class
                )
                if corroboration_boost > 0:
                    pre_boost_confidence = fusion_confidence
                    fusion_confidence = min(
                        fusion_confidence * (1.0 + corroboration_boost), 1.0
                    )
            
            fusion_type = "full"
            sources = ["image", "audio"]
        elif has_visual:
            # Visual-only fallback
            fusion_confidence = visual_conf
            fusion_type = "visual_only"
            sources = ["image"]
        else:
            # Audio-only fallback
            fusion_confidence = audio_conf
            fusion_type = "audio_only"
            sources = ["audio"]
        
        # Determine base alert level from confidence
        alert_level = self._confidence_to_alert(fusion_confidence)
        
        # Determine primary detected object
        detected_object = self._determine_primary_object(
            visual_object, audio_class, visual_conf, audio_conf
        )
        
        # Check cross-modal escalation rules
        escalation = None
        if has_visual and has_audio:
            escalation = self._check_escalation(visual_object, audio_class)
            if escalation:
                alert_level = escalation['alert_level']
                detected_object = escalation['label']
        
        fused_result = {
            "timestamp": datetime.now().isoformat(),
            "fusion_method": self.fusion_method,
            "fusion_type": fusion_type,
            "sources": sources,
            
            # Individual modality scores (for explainability)
            "visual_confidence": round(visual_conf, 4) if has_visual else None,
            "audio_confidence": round(audio_conf, 4) if has_audio else None,
            "visual_object": visual_object if has_visual else None,
            "audio_class": audio_class if has_audio else None,
            
            # Fused output
            "fusion_confidence": round(fusion_confidence, 4),
            "detected_object": detected_object,
            "alert_level": alert_level,
            
            # Corroboration boost info (for explainability)
            "corroboration_boost_applied": corroboration_boost > 0,
            "corroboration_boost_percent": round(corroboration_boost * 100, 1) if corroboration_boost > 0 else 0,
            
            # Escalation info
            "escalation_applied": escalation is not None,
            "escalation_rule": f"{visual_object}+{audio_class}" if escalation else None,
            
            # Weights used
            "weights": {
                "visual": self.visual_weight,
                "audio": self.audio_weight
            }
        }
        
        return fused_result
    
    def _confidence_to_alert(self, confidence: float) -> str:
        """Map fused confidence to alert level."""
        if confidence >= 0.90:
            return "critical"
        elif confidence >= 0.80:
            return "high"
        elif confidence >= 0.65:
            return "medium"
        elif confidence >= 0.50:
            return "low"
        else:
            return "none"
    
    def _determine_primary_object(
        self, visual_object: str, audio_class: str,
        visual_conf: float, audio_conf: float
    ) -> str:
        """Pick the primary detected object from the higher-confidence modality."""
        if visual_object and audio_class:
            return visual_object if visual_conf >= audio_conf else audio_class
        return visual_object or audio_class or "unknown"
    
    def _check_escalation(self, visual_object: str, audio_class: str) -> Optional[Dict]:
        """Check if a cross-modal escalation rule applies."""
        return self.ESCALATION_RULES.get((visual_object, audio_class))
    
    def _get_corroboration_boost(self, visual_object: str, audio_class: str) -> float:
        """
        Get corroboration boost when both modalities agree on a threat.
        
        When independent sensors (camera + microphone) both detect related
        threats, the agreement increases prediction reliability. This is
        based on the principle that the probability of two independent
        detectors both producing false positives is much lower than either
        one alone (P(FP_both) = P(FP_visual) × P(FP_audio)).
        
        Parameters:
        -----------
        visual_object : str
            Object detected by the image model
        audio_class : str
            Sound class detected by the audio model
            
        Returns:
        --------
        boost : float
            Boost factor (0.0 = no boost, 0.15 = 15% boost)
        """
        return self.CORROBORATION_RULES.get((visual_object, audio_class), 0.0)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    """
    Example usage of LateFusionEngine with Corroboration Boosting
    """
    print("\n" + "="*70)
    print("LATE FUSION ENGINE - MULTIMODAL DETECTION")
    print("="*70)
    
    engine = LateFusionEngine()
    
    print(f"\n✓ Visual weight: {engine.visual_weight}")
    print(f"✓ Audio weight:  {engine.audio_weight}")
    print(f"✓ Fusion method: {engine.fusion_method}")
    print(f"✓ Escalation rules: {len(engine.ESCALATION_RULES)}")
    print(f"✓ Corroboration rules: {len(engine.CORROBORATION_RULES)}")
    print(f"✓ Corroboration boost: {'Enabled' if engine.enable_corroboration_boost else 'Disabled'}")
    
    # Scenario 1: Full fusion — human + gunshot (escalation + corroboration boost)
    print("\n" + "-"*50)
    print("SCENARIO 1: Human (image) + Gunshot (audio)")
    print("  → Escalation + 15% Corroboration Boost")
    result = engine.fuse(
        visual_result={"confidence": 0.85, "detected_object": "human"},
        audio_result={"confidence": 0.92, "predicted_class": "gunshot"}
    )
    print(f"  Visual conf:  {result['visual_confidence']:.2%}")
    print(f"  Audio conf:   {result['audio_confidence']:.2%}")
    print(f"  Fused conf:   {result['fusion_confidence']:.2%}")
    print(f"  Boost applied: {result['corroboration_boost_percent']}%")
    print(f"  Detected: {result['detected_object']}")
    print(f"  Alert: {result['alert_level']}")
    print(f"  Escalation: {'YES — ' + result['escalation_rule'] if result['escalation_applied'] else 'No'}")
    
    # Scenario 2: Compare WITH vs WITHOUT corroboration boost
    print("\n" + "-"*50)
    print("SCENARIO 2: Corroboration Boost Comparison")
    print("  Input: Human (80%) + Gunshot (75%)")
    
    # Without boost
    engine_no_boost = LateFusionEngine(enable_corroboration_boost=False)
    result_no_boost = engine_no_boost.fuse(
        visual_result={"confidence": 0.80, "detected_object": "human"},
        audio_result={"confidence": 0.75, "predicted_class": "gunshot"}
    )
    
    # With boost
    result_with_boost = engine.fuse(
        visual_result={"confidence": 0.80, "detected_object": "human"},
        audio_result={"confidence": 0.75, "predicted_class": "gunshot"}
    )
    
    print(f"  WITHOUT boost: {result_no_boost['fusion_confidence']:.2%}")
    print(f"  WITH boost:    {result_with_boost['fusion_confidence']:.2%}")
    print(f"  Improvement:   +{(result_with_boost['fusion_confidence'] - result_no_boost['fusion_confidence']):.2%}")
    print(f"  → Boost pushes confidence from ~{result_no_boost['fusion_confidence']:.0%} to ~{result_with_boost['fusion_confidence']:.0%}")
    
    # Scenario 3: Elephant + elephant (no corroboration rule → no boost)
    print("\n" + "-"*50)
    print("SCENARIO 3: Elephant (image) + Elephant (audio)")
    print("  → No corroboration rule for wildlife-only detections")
    result = engine.fuse(
        visual_result={"confidence": 0.80, "detected_object": "elephant"},
        audio_result={"confidence": 0.75, "predicted_class": "elephant"}
    )
    print(f"  Fused confidence: {result['fusion_confidence']:.2%}")
    print(f"  Boost applied: {result['corroboration_boost_applied']}")
    print(f"  Detected: {result['detected_object']}")
    print(f"  Alert: {result['alert_level']}")
    
    # Scenario 4: Visual only
    print("\n" + "-"*50)
    print("SCENARIO 4: Visual only (no audio)")
    result = engine.fuse(
        visual_result={"confidence": 0.88, "detected_object": "lion"},
        audio_result=None
    )
    print(f"  Fused confidence: {result['fusion_confidence']:.2%}")
    print(f"  Fusion type: {result['fusion_type']}")
    print(f"  Sources: {result['sources']}")
