from prophet import Prophet
import pandas as pd
import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'Malgun Gothic'  # Windows 기준
plt.rcParams['axes.unicode_minus'] = False

# 1. 가상 데이터 생성 (날짜와 검색량)
data = {
    'ds': pd.date_range(start='2024-01-01', periods=180, freq='D'),
    'y': [500 + (i % 30) * 5 + (i % 7) * 20 for i in range(180)]  # 검색량(패턴 있는 값)
}
df = pd.DataFrame(data)

# 2. Prophet 모델 생성 및 학습
model = Prophet()
model.fit(df)

# 3. 향후 14일간 예측
future = model.make_future_dataframe(periods=14)
forecast = model.predict(future)

# 4. 예측 결과 시각화
model.plot(forecast)
plt.title("검색량 예측")
plt.xlabel("날짜")
plt.ylabel("예상 검색량")
plt.tight_layout()
plt.show()

# 5. 상위 14일 예측 데이터 출력
print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(14))
