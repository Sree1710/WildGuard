"""
ML SERVICES - LATE FUSION ENGINE
==================================
Late-fusion module that combines visual (image) and audio detection results
into a single, higher-confidence prediction.

Fusion Strategy:
- Weighted average of confidence scores (α=0.6 visual, β=0.4 audio)
- Alert escalation rules for cross-modal threat correlation
- Falls back to single-modality score when only one is available

Academic Purpose:
Demonstrates decision-level (late) fusion for multimodal wildlife monitoring.
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
    
    def __init__(self, visual_weight: float = 0.6, audio_weight: float = 0.4):
        if abs((visual_weight + audio_weight) - 1.0) > 0.01:
            raise ValueError("Weights must sum to 1.0")
        
        self.visual_weight = visual_weight
        self.audio_weight = audio_weight
        self.fusion_method = "weighted_average"
    
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
        
        if has_visual and has_audio:
            # Full late fusion — weighted average
            fusion_confidence = (
                self.visual_weight * visual_conf +
                self.audio_weight * audio_conf
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


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    """
    Example usage of LateFusionEngine
    """
    print("\n" + "="*70)
    print("LATE FUSION ENGINE - MULTIMODAL DETECTION")
    print("="*70)
    
    engine = LateFusionEngine()
    
    print(f"\n✓ Visual weight: {engine.visual_weight}")
    print(f"✓ Audio weight:  {engine.audio_weight}")
    print(f"✓ Fusion method: {engine.fusion_method}")
    print(f"✓ Escalation rules: {len(engine.ESCALATION_RULES)}")
    
    # Scenario 1: Full fusion — human + gunshot (escalation)
    print("\n" + "-"*50)
    print("SCENARIO 1: Human (image) + Gunshot (audio)")
    result = engine.fuse(
        visual_result={"confidence": 0.85, "detected_object": "human"},
        audio_result={"confidence": 0.92, "predicted_class": "gunshot"}
    )
    print(f"  Fused confidence: {result['fusion_confidence']:.2%}")
    print(f"  Detected: {result['detected_object']}")
    print(f"  Alert: {result['alert_level']}")
    print(f"  Escalation: {'YES — ' + result['escalation_rule'] if result['escalation_applied'] else 'No'}")
    
    # Scenario 2: Full fusion — elephant + elephant (corroboration)
    print("\n" + "-"*50)
    print("SCENARIO 2: Elephant (image) + Elephant (audio)")
    result = engine.fuse(
        visual_result={"confidence": 0.80, "detected_object": "elephant"},
        audio_result={"confidence": 0.75, "predicted_class": "elephant"}
    )
    print(f"  Fused confidence: {result['fusion_confidence']:.2%}")
    print(f"  Detected: {result['detected_object']}")
    print(f"  Alert: {result['alert_level']}")
    
    # Scenario 3: Visual only
    print("\n" + "-"*50)
    print("SCENARIO 3: Visual only (no audio)")
    result = engine.fuse(
        visual_result={"confidence": 0.88, "detected_object": "lion"},
        audio_result=None
    )
    print(f"  Fused confidence: {result['fusion_confidence']:.2%}")
    print(f"  Fusion type: {result['fusion_type']}")
    print(f"  Sources: {result['sources']}")
