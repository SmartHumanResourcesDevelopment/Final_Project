from prophet import Prophet
import pandas as pd
from pathlib import Path

data = {
    "ds": ["2025-07-11", "2025-07-12", "2025-07-13", "2025-07-14", "2025-07-15"],
    "tang": [120, 190, 260, 310, 380],
    "mara": [95, 110, 150, 170, 200],
    "zero": [90, 120, 160, 200, 230],
}
df_all = pd.DataFrame(data)

merged = None
for kw in ["tang", "mara", "zero"]:
    df = df_all[["ds", kw]].rename(columns={kw: "y"})
    df["ds"] = pd.to_datetime(df["ds"])

    m = Prophet(daily_seasonality=True).fit(df)
    fcst = m.predict(m.make_future_dataframe(periods=3))[["ds", "yhat"]]
    fcst = fcst.rename(columns={"ds": "date", "yhat": kw})

    merged = fcst if merged is None else merged.merge(fcst, on="date")

merged["date"] = merged["date"].dt.strftime("%m/%d")
cut = len(merged) - 3
merged["isForecast"] = [i >= cut for i in range(len(merged))]

out = Path(__file__).resolve().parents[1] / "FrontEnd" / "public" / "data"
out.mkdir(parents=True, exist_ok=True)
merged.to_json(out / "forecast_data.json", orient="records", indent=2, force_ascii=False)
print("✅  forecast_data.json →", out / "forecast_data.json")
