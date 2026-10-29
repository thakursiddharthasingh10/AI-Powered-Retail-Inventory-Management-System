# Retail AI Intelligence Microservice

FastAPI microservice providing statistical time-series demand forecasting, deterministic safety-stock reorder recommendations, and natural-language retail assistance.

---

## 1. Setup Instructions

```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 2. API Endpoints

- `GET /health`: Health and algorithm check
- `POST /forecast`: Generate 7, 14, or 30-day demand forecast
- `GET /forecast/{productId}`: Quick product forecast endpoint
- `POST /model/evaluate`: Chronological train/test split evaluation comparing baseline MAE vs linear regression
- `POST /chat`: Grounded natural language query assistant

---

## 3. Running Unit Tests

```bash
pytest tests/
```
