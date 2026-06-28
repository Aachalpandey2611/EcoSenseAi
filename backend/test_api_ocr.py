import requests

url = "http://localhost:8005/api/v1/ocr/analyze"
file_path = "test_img.png"

# create dummy image if not exists
try:
    with open(file_path, "rb") as f:
        pass
except:
    from PIL import Image
    img = Image.new('RGB', (60, 30), color = 'red')
    img.save(file_path)

with open(file_path, "rb") as f:
    files = {"file": (file_path, f, "image/png")}
    print("Sending POST request to", url)
    headers = {"Authorization": "Bearer fake_token"}
    response = requests.post(url, files=files, headers=headers)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
