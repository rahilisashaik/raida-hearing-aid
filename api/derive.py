import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from .constants import _FREQS

def derive_gain_profile_from_row(
    row: pd.Series,
    reference: str = "pta4",
    compression_ratio: float = 0.5,
    max_gain: float = 25.0,
    smoothing: str = "ma3",
):
    """
    Returns: gain_df (freq_hz, gain)
    """
    thresholds = np.array([
        row["threshold_250"],
        row["threshold_500"],
        row["threshold_1000"],
        row["threshold_2000"],
        row["threshold_4000"],
        row["threshold_8000"],
    ], dtype=float)

    # reference threshold
    if reference == "min":
        tref = float(np.min(thresholds))
    elif reference == "median_mid":
        tref = float(np.median([row["threshold_500"], row["threshold_1000"], row["threshold_2000"]]))
    elif reference == "pta4":
        tref = float(np.mean([row["threshold_500"], row["threshold_1000"], row["threshold_2000"], row["threshold_4000"]]))
    else:
        raise ValueError("reference must be one of: min, median_mid, pta4")

    deficit = np.maximum(0.0, thresholds - tref)
    gain = np.minimum(max_gain, compression_ratio * deficit)

    if smoothing == "ma3":
        g = gain.copy()
        sm = []
        for i in range(len(g)):
            left = g[i-1] if i-1 >= 0 else g[i]
            mid = g[i]
            right = g[i+1] if i+1 < len(g) else g[i]
            sm.append((left + mid + right) / 3.0)
        gain = np.array(sm, dtype=float)
    elif smoothing != "none":
        raise ValueError("smoothing must be 'none' or 'ma3'")

    gain_df = pd.DataFrame({
        "freq_hz": list(_FREQS),
        "gain": np.round(gain, 2),
        "reference_threshold": tref,
        "compression_ratio": compression_ratio,
        "max_gain": max_gain,
        "reference_method": reference,
        "smoothing": smoothing,
    })

    return gain_df


