let info = {
    class_id: 0,
    stud_ids: [1]
};

fetch("http://localhost:8000/api/classes/add", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(info)
}).then(res => res.json()).then(j_res => console.log(j_res));