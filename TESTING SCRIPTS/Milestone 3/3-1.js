let id = 0;
let url = "http://localhost:8000/api/stud_data/" + id.toString();
fetch(url).then(resp => resp.json()).then(r_json => console.log(r_json));