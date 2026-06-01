import base64
try:
    with open(r"f:\logo.png", "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    
    html_path = r"f:\index.html"
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = content.replace("img.src = 'splash-logo.jpg';", f"img.src = 'data:image/png;base64,{b64}';")
    
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: Embedded logo.png as base64.")
except Exception as e:
    print("ERROR:", e)
