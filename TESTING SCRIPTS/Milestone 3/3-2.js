let info = {
    id: 0,
    name: "ReeseHe1"
}

fetch("http://localhost:8000/api/students/upd_user", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(info)
}).then(resp => resp.json()).then(j_resp => console.log(j_resp));