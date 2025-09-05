# inventory/tasks.py

import pandas as pd
import numpy as np
from .models import StockMovement
from statsmodels.tsa.arima.model import ARIMA # <-- NEW IMPORT
import warnings

# Suppress statistical warnings from the model for a cleaner console
warnings.filterwarnings("ignore", category=UserWarning)

def get_sales_forecast(product_id):
    """
    Analyzes a product's sales history using an ARIMA time-series model 
    and forecasts demand for the next 4 months.
    """
    movements = StockMovement.objects.filter(
        product_id=product_id, 
        quantity_change__lt=0
    ).order_by('timestamp')

    # We need at least 3 data points for a simple ARIMA model
    if len(movements) < 3:
        return None

    df = pd.DataFrame(list(movements.values('timestamp', 'quantity_change')))
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['quantity_sold'] = df['quantity_change'].abs()
    
    # Aggregate sales by month. The timestamp will be the last day of the month.
    sales_by_month = df.set_index('timestamp').resample('M').sum()['quantity_sold']
    
    if len(sales_by_month) < 3:
        return None
        
    # --- NEW: Train and predict using the ARIMA model ---
    try:
        # The order (p,d,q) is a standard starting point for non-seasonal data.
        # p: autoregressive part, d: differencing part, q: moving average part.
        model = ARIMA(sales_by_month, order=(1, 1, 1))
        model_fit = model.fit()
        
        # Forecast the next 4 periods (months)
        predictions = model_fit.forecast(steps=4)
        
        forecast = [int(max(0, p)) for p in predictions]

        historical_data = {
            "labels": sales_by_month.index.strftime('%Y-%m').tolist(),
            "data": sales_by_month.values.tolist()
        }
        
        return {
            "historical": historical_data,
            "forecast": forecast
        }
    except Exception as e:
        # The model can fail if the data is not suitable (e.g., all zeros).
        print(f"ARIMA model failed for product {product_id}: {e}")
        return None