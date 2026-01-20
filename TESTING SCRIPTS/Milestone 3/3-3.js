let info = {
    id: 0,
    hash: "edehfue77762"
}

fetch("http://localhost:8000/api/students/upd_pass", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(info)
}).then(resp => resp.json()).then(j_resp => console.log(j_resp));