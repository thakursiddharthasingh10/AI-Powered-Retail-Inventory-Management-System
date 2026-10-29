import unittest
import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.forecaster import generate_synthetic_history, evaluate_forecast_models, produce_forecast

class TestForecastService(unittest.TestCase):

    def test_generate_synthetic_history(self):
        history = generate_synthetic_history(product_id=1, days=30)
        self.assertEqual(len(history), 30)
        self.assertIn("date", history[0])
        self.assertIn("quantity", history[0])
        self.assertTrue(all(item["quantity"] >= 0 for item in history))

    def test_evaluate_forecast_models(self):
        history = generate_synthetic_history(product_id=1, days=30)
        metrics = evaluate_forecast_models(history)
        self.assertIn("baseline_mae", metrics)
        self.assertIn("regression_mae", metrics)
        self.assertIn("regression_rmse", metrics)
        self.assertEqual(metrics["train_size"], 24)
        self.assertEqual(metrics["test_size"], 6)

    def test_produce_forecast(self):
        result = produce_forecast(product_id=1, horizon_days=14)
        self.assertEqual(result["productId"], 1)
        self.assertEqual(result["horizonDays"], 14)
        self.assertEqual(len(result["forecastPoints"]), 14)
        self.assertGreaterEqual(result["mae"], 0)
        self.assertGreaterEqual(result["totalPredictedDemand"], 0)
        first_pt = result["forecastPoints"][0]
        self.assertIn("date", first_pt)
        self.assertIn("predictedQuantity", first_pt)
        self.assertIn("lowerBound", first_pt)
        self.assertIn("upperBound", first_pt)
        self.assertGreaterEqual(first_pt["upperBound"], first_pt["lowerBound"])

if __name__ == "__main__":
    unittest.main()
