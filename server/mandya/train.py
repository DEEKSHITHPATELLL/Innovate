import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score

# Step 1: Load the dataset
file_path = "data/villages_near_mandya_data.csv"
data_clean = pd.read_csv(file_path)

# Step 2: Encode categorical data and prepare the dataset
label_encoder_area = LabelEncoder()
label_encoder_business = LabelEncoder()

data_clean['Area Name'] = label_encoder_area.fit_transform(data_clean['Area Name'])
data_clean['Business Name'] = label_encoder_business.fit_transform(data_clean['Business Name'])

# Define input features and target
X = data_clean[['Area Name', 'Population', 'Business Name', 'Number of Businesses', 'Need']]
y = data_clean['Success Rate (%)'].str.rstrip('%').astype(float)  # Convert percentage string to float

# Step 3: Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 4: Train the model (Linear Regression)
model = LinearRegression()
model.fit(X_train, y_train)

# Step 5: Predict on test data
y_pred = model.predict(X_test)

# Step 6: Evaluate the model
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae}")
print(f"R^2 Score: {r2}")

# ---------------- Step 7: Save Model and Encoders -----------------

# Save the trained model
with open('model.pkl', 'wb') as model_file:
    pickle.dump(model, model_file)

# Save the LabelEncoders
with open('label_encoder_area.pkl', 'wb') as le_area_file:
    pickle.dump(label_encoder_area, le_area_file)

with open('label_encoder_business.pkl', 'wb') as le_business_file:
    pickle.dump(label_encoder_business, le_business_file)

print("Model and LabelEncoders have been saved successfully!")
