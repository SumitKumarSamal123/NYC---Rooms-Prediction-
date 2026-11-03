# StayScope — NYC Room Type Predictor

StayScope is a machine learning project that predicts the room type of a New York City listing from its location, price, availability, and host and guest activity. It includes a Jupyter notebook for data analysis and model training, plus a FastAPI service and an interactive dark-themed frontend.

## Features

- Predicts a listing’s room type using a trained scikit-learn pipeline.
- Shows the predicted room type and model confidence.
- Displays probabilities for each room type.
- Accepts listing details through a responsive web form.
- Provides a FastAPI endpoint for programmatic predictions.

## Project files

| File | Purpose |
| --- | --- |
| `Model.ipynb` | Data exploration, preprocessing, model evaluation, and training |
| `NYC_Data.csv` | Dataset used by the notebook |
| `Model_Pipeline.pkl` | Trained model pipeline loaded by the API |
| `main.py` | FastAPI application and prediction endpoint |
| `index.html` | Frontend page |
| `style.css` | Frontend styling |
| `script.js` | Form behavior and API requests |
| `requirements.txt` | Python dependencies |

## Run locally

Requirements: Python 3.10 or newer and Git LFS if you need to download the model from GitHub.

1. Open a terminal in the project folder.
2. Create and activate a virtual environment:

   **Windows PowerShell**
   ```powershell
   python -m venv .venv
   .venv\Scripts\Activate.ps1
