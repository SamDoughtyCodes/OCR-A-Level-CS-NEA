let info = {
    set_id: 1,
    due: "20260705",
    class_id: 1,
    name: "test"
}

fetch("http://localhost:8000/api/tasks/new", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(info)
}).then(res => res.json()).then(j_res => console.log(j_res));
