const fs = require('fs');
const input_source = "./input.txt";

var data_object = {
  "number_of_links": 0,
  "links": [],
  "number_of_demands": 0,
  "demands": []
};



fs.readFile(input_source, 'utf8', (err, data) => {
  if (err) throw err;

  data = data.split("\r\n");


//Start of reading links
  data_object["number_of_links"] = data[0];

  for(var i = 1; i<data.length; i++) {

    if (data[i] == "-1") {
      break;
      }

      let link = data[i].split(" ");
      data_object.links[i-1] = {};
      data_object.links[i-1]["start_node_id"] = link[0];
      data_object.links[i-1]["end_node_id"] = link[1];
      data_object.links[i-1]["number_of_fibre_pairs_in_cable"] = link[2];
      data_object.links[i-1]["fibre_pair_cost"] = link[3];
      data_object.links[i-1]["number_of_lambdas_in_fibre"] = link[4];

  }

//Start of reading demands
i = i+2;

data_object["number_of_demands"] = data[i];
i = i + 2;
for (i, k = 0; i<data.length; i++, k++) {
  let demand = data[i].split(" ");
  data_object.demands[k] = {};
  data_object.demands[k]["start_node_id"] = demand[0];
  data_object.demands[k]["end_node_id"] = demand[1];
  data_object.demands[k]["demand_volume"] = demand[2];

  i++;
  data_object.demands[k]["number_of_demand_paths"] = data[i];
  i++;
  data_object.demands[k]["demand_path_list"] = [];


  for(var q = 0; q<data_object.demands[k]["number_of_demand_paths"]; i++, q++) {
      let demand_links = data[i].split(" ");
      data_object.demands[k]["demand_path_list"][q+1] = {};
      data_object.demands[k]["demand_path_list"][q+1]["id"] = demand_links.shift();
      demand_links.pop();
      data_object.demands[k]["demand_path_list"][q+1]["links"] = demand_links;
  }
}






  console.log(data_object);


});
