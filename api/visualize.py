import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from .constants import _FREQS

def plot_audiogram_template_style(
    row_left: pd.Series,
    row_right: pd.Series,
    *,
    title: str = "Pure Tone Audiogram",
    y_label: str = "Volume (dB)",
    figsize=(10, 6),
    connect_lines: bool = True,
):
    """
    Plot a two-ear audiogram similar to the reference template.

    Inputs:
      - row_left:  pandas Series for LEFT ear with columns threshold_250...threshold_8000
      - row_right: pandas Series for RIGHT ear with columns threshold_250...threshold_8000

    Output:
      - (fig, ax)
    """
    def _extract(row: pd.Series) -> np.ndarray:
        return np.array([
            float(row["threshold_250"]),
            float(row["threshold_500"]),
            float(row["threshold_1000"]),
            float(row["threshold_2000"]),
            float(row["threshold_4000"]),
            float(row["threshold_8000"]),
        ], dtype=float)

    yL = _extract(row_left)
    yR = _extract(row_right)
    x = np.array(_FREQS, dtype=float)

    fig, ax = plt.subplots(figsize=figsize)

    # Right ear: open circles; Left ear: X
    if connect_lines:
        ax.plot(x, yR, linestyle="-", linewidth=2, marker="o", markersize=9,
                markerfacecolor="none", label="Right Ear")
        ax.plot(x, yL, linestyle="-", linewidth=2, marker="x", markersize=9,
                label="Left Ear")
    else:
        ax.plot(x, yR, linestyle="None", marker="o", markersize=9,
                markerfacecolor="none", label="Right Ear")
        ax.plot(x, yL, linestyle="None", marker="x", markersize=9,
                label="Left Ear")

    # Axes: frequency on x, dB on y
    ax.set_xscale("log")
    ax.set_xlim(200, 10000)
    ax.set_xticks(list(_FREQS))
    ax.set_xticklabels([str(f) for f in _FREQS])
    ax.set_xlabel("Frequency (Hz)")

    # Audiogram convention: lower thresholds near top
    ax.set_ylim(120, -10)
    ax.set_ylabel(y_label)

    # Grid styling similar to typical audiogram templates
    ax.set_yticks(np.arange(-10, 121, 10))
    ax.grid(which="major", axis="both", linewidth=1, alpha=0.65)
    ax.minorticks_on()
    ax.grid(which="minor", axis="both", linewidth=0.5, alpha=0.25)

    # Title + legend
    ax.set_title(title, loc="left", fontsize=16, fontweight="bold")
    ax.legend(loc="upper right", frameon=False)

    # Optional small identifier line
    pid = row_left.get("participant_id", "")
    dt = row_left.get("date_tested", "")
    if pid or dt:
        ax.text(0.0, 1.02, f"{pid}  {dt}", transform=ax.transAxes,
                ha="left", va="bottom", fontsize=10)

    return fig, ax


def construct_audiogram_from_row(row: pd.Series, invert_y: bool = True):
    """
    Returns: audiogram_df (freq_hz, threshold), fig
    """
    audiogram_df = pd.DataFrame({
        "freq_hz": list(_FREQS),
        "threshold": [
            row["threshold_250"],
            row["threshold_500"],
            row["threshold_1000"],
            row["threshold_2000"],
            row["threshold_4000"],
            row["threshold_8000"],
        ],
    })

    fig = plt.figure()
    plt.plot(audiogram_df["freq_hz"], audiogram_df["threshold"], marker="o")
    plt.xscale("log")
    plt.xticks(list(_FREQS), [str(f) for f in _FREQS])
    if invert_y:
        plt.gca().invert_yaxis()
    plt.xlabel("Frequency (Hz)")
    plt.ylabel("Threshold (app-reported)")
    plt.title(f"Audiogram: {row['participant_id']} {row['ear']} {row['date_tested']}")
    return audiogram_df, fig
