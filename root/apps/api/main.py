from fastapi  import FastAPI

app=FastAPI()


users =[
    {"id": 1, "name": "Alice"},
    {"id":2, "name": "Bob"}
]


@app.get("/")
def read_root():
    return {"message": "Hello FASTAPI"} 

@app.get("/users")
def get_users():
    return users