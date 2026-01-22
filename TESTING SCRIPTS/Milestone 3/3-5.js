let info = {
    name: "testclass",
    owner_id: 1
}

fetch("http://localhost:8000/api/classes/new", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(info)
}).then(res => res.json()).then(j_res => console.log(j_res));