# Cell 1: Audiograms for PTA4 Reference Method
cell_1 = '''# Audiograms for all participants - PTA4 Reference Method
for pid in df["participant_id"].unique():
    left_rows = df[(df["participant_id"] == pid) & (df["ear"] == "L")]
    right_rows = df[(df["participant_id"] == pid) & (df["ear"] == "R")]
    
    if left_rows.empty or right_rows.empty:
        continue
    
    row_L = left_rows.iloc[0]
    row_R = right_rows.iloc[0]
    
    fig_aud, ax_aud = plot_audiogram_template_style(
        row_left=row_L,
        row_right=row_R,
        title=f"Audiogram - {pid} ({row_L['participant_name']}) - PTA4 Method",
        y_label="Hearing Level (dB HL)"
    )
    plt.show()
'''

# Cell 2: Audiograms for MIN Reference Method  
cell_2 = '''# Audiograms for all participants - MIN Reference Method
for pid in df["participant_id"].unique():
    left_rows = df[(df["participant_id"] == pid) & (df["ear"] == "L")]
    right_rows = df[(df["participant_id"] == pid) & (df["ear"] == "R")]
    
    if left_rows.empty or right_rows.empty:
        continue
    
    row_L = left_rows.iloc[0]
    row_R = right_rows.iloc[0]
    
    fig_aud, ax_aud = plot_audiogram_template_style(
        row_left=row_L,
        row_right=row_R,
        title=f"Audiogram - {pid} ({row_L['participant_name']}) - MIN Method",
        y_label="Hearing Level (dB HL)"
    )
    plt.show()
'''

# Cell 3: Audiograms for MEDIAN_MID Reference Method
cell_3 = '''# Audiograms for all participants - MEDIAN_MID Reference Method
for pid in df["participant_id"].unique():
    left_rows = df[(df["participant_id"] == pid) & (df["ear"] == "L")]
    right_rows = df[(df["participant_id"] == pid) & (df["ear"] == "R")]
    
    if left_rows.empty or right_rows.empty:
        continue
    
    row_L = left_rows.iloc[0]
    row_R = right_rows.iloc[0]
    
    fig_aud, ax_aud = plot_audiogram_template_style(
        row_left=row_L,
        row_right=row_R,
        title=f"Audiogram - {pid} ({row_L['participant_name']}) - MEDIAN_MID Method",
        y_label="Hearing Level (dB HL)"
    )
    plt.show()
'''

# Cell 4: Gain Plots for PTA4 Reference Method
cell_4 = '''# Gain Profiles for all participants - PTA4 Reference Method
for pid in df["participant_id"].unique():
    left_rows = df[(df["participant_id"] == pid) & (df["ear"] == "L")]
    right_rows = df[(df["participant_id"] == pid) & (df["ear"] == "R")]
    
    if left_rows.empty or right_rows.empty:
        continue
    
    row_L = left_rows.iloc[0]
    row_R = right_rows.iloc[0]
    
    # Generate gain profiles using PTA4 method
    gain_L_df = derive_gain_profile_from_row(
        row_L, 
        reference="pta4", 
        compression_ratio=0.5, 
        max_gain=25, 
        smoothing="ma3"
    )
    gain_R_df = derive_gain_profile_from_row(
        row_R, 
        reference="pta4", 
        compression_ratio=0.5, 
        max_gain=25, 
        smoothing="ma3"
    )
    
    fig_gain, ax_gain = plot_gain_profile(
        gain_L_df,
        gain_R_df,
        title=f"Gain Profile - {pid} ({row_L['participant_name']}) - PTA4 Method"
    )
    plt.show()
'''

# Cell 5: Gain Plots for MIN Reference Method
cell_5 = '''# Gain Profiles for all participants - MIN Reference Method
for pid in df["participant_id"].unique():
    left_rows = df[(df["participant_id"] == pid) & (df["ear"] == "L")]
    right_rows = df[(df["participant_id"] == pid) & (df["ear"] == "R")]
    
    if left_rows.empty or right_rows.empty:
        continue
    
    row_L = left_rows.iloc[0]
    row_R = right_rows.iloc[0]
    
    # Generate gain profiles using MIN method
    gain_L_df = derive_gain_profile_from_row(
        row_L, 
        reference="min", 
        compression_ratio=0.5, 
        max_gain=25, 
        smoothing="ma3"
    )
    gain_R_df = derive_gain_profile_from_row(
        row_R, 
        reference="min", 
        compression_ratio=0.5, 
        max_gain=25, 
        smoothing="ma3"
    )
    
    fig_gain, ax_gain = plot_gain_profile(
        gain_L_df,
        gain_R_df,
        title=f"Gain Profile - {pid} ({row_L['participant_name']}) - MIN Method"
    )
    plt.show()
'''

# Cell 6: Gain Plots for MEDIAN_MID Reference Method
cell_6 = '''# Gain Profiles for all participants - MEDIAN_MID Reference Method
for pid in df["participant_id"].unique():
    left_rows = df[(df["participant_id"] == pid) & (df["ear"] == "L")]
    right_rows = df[(df["participant_id"] == pid) & (df["ear"] == "R")]
    
    if left_rows.empty or right_rows.empty:
        continue
    
    row_L = left_rows.iloc[0]
    row_R = right_rows.iloc[0]
    
    # Generate gain profiles using MEDIAN_MID method
    gain_L_df = derive_gain_profile_from_row(
        row_L, 
        reference="median_mid", 
        compression_ratio=0.5, 
        max_gain=25, 
        smoothing="ma3"
    )
    gain_R_df = derive_gain_profile_from_row(
        row_R, 
        reference="median_mid", 
        compression_ratio=0.5, 
        max_gain=25, 
        smoothing="ma3"
    )
    
    fig_gain, ax_gain = plot_gain_profile(
        gain_L_df,
        gain_R_df,
        title=f"Gain Profile - {pid} ({row_L['participant_name']}) - MEDIAN_MID Method"
    )
    plt.show()
'''

print("Cells generated successfully!")
print("\nTo add these to your notebook, copy each cell's content.")
print("\nCell 1: Audiograms - PTA4")
print(cell_1)
print("\nCell 2: Audiograms - MIN")
print(cell_2)
print("\nCell 3: Audiograms - MEDIAN_MID")
print(cell_3)
print("\nCell 4: Gain Plots - PTA4")
print(cell_4)
print("\nCell 5: Gain Plots - MIN")
print(cell_5)
print("\nCell 6: Gain Plots - MEDIAN_MID")
print(cell_6)