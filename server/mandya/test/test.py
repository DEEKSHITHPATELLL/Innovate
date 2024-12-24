import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LinearRegression

# Step 1: Load the cleaned dataset to use LabelEncoders
file_path = "/data/cleaned_sorted_villages_near_mandya_data.csv"
data_clean = pd.read_csv(file_path)

# Step 2: Encode 'Area Name' and 'Business Name' using Label Encoding
label_encoder_area = LabelEncoder()
label_encoder_business = LabelEncoder()

data_clean['Area Name'] = label_encoder_area.fit_transform(data_clean['Area Name'])
data_clean['Business Name'] = label_encoder_business.fit_transform(data_clean['Business Name'])

# Train the model as a reference
X = data_clean[['Area Name', 'Population', 'Business Name', 'Number of Businesses', 'Need']]
y = data_clean['Success Rate (%)'].str.rstrip('%').astype(float)
model = LinearRegression()
model.fit(X, y)

# Step 3: Load the test dataset
new_data_file = "test_data.csv"
test_data = pd.read_csv(new_data_file)

# Select only 10 rows from the test dataset
test_data_sample = test_data.sample(10, random_state=42)  # Randomly selecting 10 rows

# Encode categorical data in test dataset
test_data_sample['Area Name'] = label_encoder_area.transform(test_data_sample['Area Name'])
test_data_sample['Business Name'] = label_encoder_business.transform(test_data_sample['Business Name'])

# Define input features
X_test_sample = test_data_sample[['Area Name', 'Population', 'Business Name', 'Number of Businesses', 'Need']]

# Predict Success Rates for 10 rows
test_data_sample['Predicted Success Rate (%)'] = model.predict(X_test_sample)

# Decode Area and Business Names back to their original string representation
test_data_sample['Area Name'] = label_encoder_area.inverse_transform(test_data_sample['Area Name'])
test_data_sample['Business Name'] = label_encoder_business.inverse_transform(test_data_sample['Business Name'])

# Save predictions to an output CSV
output_path = "predicted_results_10rows.csv"
test_data_sample.to_csv(output_path, index=False)

# Print results to console
print(f"Predictions have been written to {output_path}")
print(test_data_sample[['Area Name', 'Business Name', 'Predicted Success Rate (%)']])
