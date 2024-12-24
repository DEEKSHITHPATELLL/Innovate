import pandas as pd
import random

# --------------------- Step 1: Generate a Dataset ---------------------

# Define sample areas and business types
areas = [
    "Guttalu", "Srirangapatna", "Maddur", "Pandavapura", "Nagamangala", "Malavalli", 
    "Shivalli", "Belakavadi", "Kikkeri", "Keregodu", "Hosahalli", "Dudda", 
    "Kirugavalu", "Basaralu", "Mandagere", "Halagur", "Konnanur", "Kyathaghatta",
    "Melkote", "Hulivana"
]

business_types = ["Restaurant", "Gym", "Pharmacy", "Coffee Shop", "Grocery Store", "Electronics Shop"]

# Dictionary to maintain unique area-business combinations with population values
area_business_population = {}

# Dictionary to maintain business-specific unique numbers and success rates
business_unique_values = {}

unique_combinations = set()

# Create a dataset
data = []

num_rows = 10  # Number of rows you want to generate

for i in range(num_rows):
    while True:
        area = random.choice(areas)
        business = random.choice(business_types)

        # Assign a population to the area if it's not already assigned
        if area not in area_business_population:
            area_business_population[area] = random.randint(5000, 20000)

        population = area_business_population[area]

        # Ensure business numbers and success rate remain unique
        if (area, business) not in business_unique_values:
            business_unique_values[(area, business)] = []

        num_businesses = random.randint(5, 50)
        need = round(random.uniform(50, 70), 2)

        # Calculate Success Rate as a percentage and round to 2 decimal places
        success_rate = round((population * need) / num_businesses / 100, 2)

        if (num_businesses, need) not in business_unique_values[(area, business)]:
            business_unique_values[(area, business)].append((num_businesses, need))

            combination = (area, population, business, num_businesses, need)

            if combination not in unique_combinations:
                unique_combinations.add(combination)
                data.append(list(combination))
                break

# Create a DataFrame
columns = ["Area Name", "Population", "Business Name", "Number of Businesses", "Need"]
df = pd.DataFrame(data, columns=columns)

file_path = "business_data.csv"
df.to_csv(file_path, index=False)

print(f"Dataset saved to {file_path}")

# --------------------- Step 2: Clean and Sort the Dataset ---------------------

# Load the dataset into a DataFrame
data_clean = pd.read_csv(file_path)

# Remove duplicate rows based on 'Area Name' and 'Business Name' columns
data_clean.drop_duplicates(subset=['Area Name', 'Business Name'], inplace=True)

# Sort the dataset by 'Area Name' in ascending order
data_clean = data_clean.sort_values(by="Area Name", ascending=True)

# Save the cleaned dataset back to a new CSV file
clean_file_path = "test_data.csv"
data_clean.to_csv(clean_file_path, index=False)

print(f"Cleaned and sorted dataset saved to {clean_file_path}")
