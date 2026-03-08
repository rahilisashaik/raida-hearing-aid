"""
Load and normalize hearing-test data from raw/ CSVs.

Expected CSV columns (names may have spaces; they are normalized):
  participant name/id, date tested, age, ear (L/R),
  threshold_250, threshold_500, threshold_1000, threshold_2000, threshold_4000, threshold_8000,
  notes

Returns a DataFrame with schema expected by api.visualize and api.derive:
  participant_name, participant_id, date_tested, age, ear,
  threshold_250, threshold_500, threshold_1000, threshold_2000, threshold_4000, threshold_8000,
  notes
"""

import os
import pandas as pd

COLUMN_MAP = {
    "participant name": "participant_name",
    "participant id": "participant_id",
    "date tested": "date_tested",
    "ear": "ear",
    "threshold_250": "threshold_250",
    "threshold_500": "threshold_500",
    "threshold_1000": "threshold_1000",
    "threshold_2000": "threshold_2000",
    "threshold_4000": "threshold_4000",
    "threshold_8000": "threshold_8000",
    "notes": "notes",
    "age": "age",
}

THRESHOLD_COLS = [
    "threshold_250",
    "threshold_500",
    "threshold_1000",
    "threshold_2000",
    "threshold_4000",
    "threshold_8000",
]


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Map CSV column names to internal schema (strip whitespace, lowercase for matching)."""
    rename = {}
    for c in df.columns:
        key = str(c).strip().lower()
        if key in COLUMN_MAP:
            rename[c] = COLUMN_MAP[key]
    return df.rename(columns=rename)


def load_raw_csv(path: str) -> pd.DataFrame:
    """
    Load a single raw CSV from path.
    - Skips empty leading rows and normalizes column names.
    - Drops rows where participant_id or ear is missing, or all threshold columns are missing.
    - Converts threshold columns to float (non-numeric -> NaN).
    """
    df = pd.read_csv(path)

    # Drop completely empty rows and normalize column names
    df = df.dropna(how="all")
    df = _normalize_columns(df)

    # Require at least these columns
    for col in ["participant_id", "ear"]:
        if col not in df.columns:
            raise ValueError(f"CSV missing required column: {col}")

    # Drop rows missing participant_id or ear
    df = df.dropna(subset=["participant_id", "ear"])
    df["participant_id"] = df["participant_id"].astype(str).str.strip()
    df["ear"] = df["ear"].astype(str).str.strip().str.upper()

    # Normalize ear to L / R
    df["ear"] = df["ear"].replace({"LEFT": "L", "RIGHT": "R"})

    # Ensure threshold columns exist and are numeric
    for col in THRESHOLD_COLS:
        if col not in df.columns:
            df[col] = float("nan")
        else:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop rows that have no threshold data at all
    df = df.dropna(subset=THRESHOLD_COLS, how="all")

    # Optional: normalize participant_name and date_tested if present
    if "participant_name" in df.columns:
        df["participant_name"] = df["participant_name"].astype(str).str.strip()
    if "date_tested" in df.columns:
        df["date_tested"] = df["date_tested"].astype(str).str.strip()

    return df.reset_index(drop=True)


def load_raw_directory(raw_dir: str = "raw") -> pd.DataFrame:
    """
    Load all CSV files from raw_dir and concatenate into one DataFrame.
    """
    if not os.path.isdir(raw_dir):
        return pd.DataFrame()

    frames = []
    for path in sorted(raw_dir.glob("*.csv")):
        try:
            frames.append(load_raw_csv(path))
        except Exception as e:
            raise RuntimeError(f"Failed to load {path}: {e}") from e

    if not frames:
        return pd.DataFrame()
    return pd.concat(frames, ignore_index=True)
