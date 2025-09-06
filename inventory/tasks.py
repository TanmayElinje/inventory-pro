# inventory/tasks.py

import pandas as pd
import numpy as np
from .models import StockMovement
from statsmodels.tsa.arima.model import ARIMA 
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

def get_sales_forecast(product_id):
    movements = StockMovement.objects.filter(
        product_id=product_id, 
        quantity_change__lt=0
    ).order_by('timestamp')

    if len(movements) < 3:
        return None

    df = pd.DataFrame(list(movements.values('timestamp', 'quantity_change')))
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['quantity_sold'] = df['quantity_change'].abs()
    
    sales_by_month = df.set_index('timestamp').resample('M').sum()['quantity_sold']
    
    if len(sales_by_month) < 3:
        return None
        
    try:
        model = ARIMA(sales_by_month, order=(1, 1, 1))
        model_fit = model.fit()
        
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
        print(f"ARIMA model failed for product {product_id}: {e}")
        return None
