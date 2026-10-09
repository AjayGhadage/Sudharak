def analyze_issue(detection_result: dict):
    """
    Produce preliminary ML analysis metrics based on object detection output.
    """
    category = detection_result.get("category", "OTHER")
    confidence = detection_result.get("confidence", 0.85)

    severity_map = {
        "POTHOLE": "HIGH",
        "GARBAGE": "MEDIUM",
        "WATER": "HIGH",
        "INFRASTRUCTURE": "CRITICAL",
        "OTHER": "LOW"
    }

    cost_map = {
        "POTHOLE": 180.00,
        "GARBAGE": 120.00,
        "WATER": 250.00,
        "INFRASTRUCTURE": 400.00,
        "OTHER": 100.00
    }

    severity = severity_map.get(category, "MEDIUM")
    estimated_cost = cost_map.get(category, 150.00)

    # Calculate priority score (0-100)
    severity_score = {"LOW": 20, "MEDIUM": 50, "HIGH": 75, "CRITICAL": 95}.get(severity, 50)
    priority = int((severity_score * 0.6) + (confidence * 40))

    return {
        "category": category,
        "confidence": confidence,
        "severity": severity,
        "estimatedCost": estimated_cost,
        "priorityScore": min(priority, 100),
        "detections": detection_result.get("detections", [])
    }
