const fs = require('fs');
const input_source = "./input2.txt";
const table_length = 1000;

var rand = Math.random(42);
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
      data_object.demands[k]["demand_path_list"][q+1] = [];
      data_object.demands[k]["demand_path_list"][q+1]["id"] = demand_links.shift();
      demand_links.pop();
      data_object.demands[k]["demand_path_list"][q+1]["links"] = demand_links;
  }


}

  var result_table = create_table(data_object, table_length);


 //solve("bruteforce", data_object, result_table);
 result_table = evolution(result_table);
 solve("bruteforce", data_object, result_table);



});

var link_computation = function(data_object, result_table) {
var link_load = [];
var link_capacity = [];
var i = 0;
  for(var e = 1; e <= data_object.links.length; e++) {

      link_load[i] = 0;
      i++;
  }

  for (var d = 0; d < data_object.demands.length; d++){
    var demand = data_object.demands[d];
    for (var p = 1; p < demand.demand_path_list.length; p++){
      for (var e = 1; e <= data_object.links.length; e++) {
        var path = demand.demand_path_list[p];
        if (path.links.includes(e + '')) {
            link_load[e-1] += parseInt(result_table[d][p-1]);
        }
      }
    }
  }

  for(var e = 0; e < data_object.links.length; e++){

    var M = parseInt(data_object.links[e].number_of_lambdas_in_fibre);

      link_capacity[e] = link_load[e];

  }
  // console.log(result_table);
  // console.log(link_capacity);
  return [link_capacity, link_load];


}

var create_table = function(data_object, number_of_tables) {

  var result_table = new Array();

for (var i = 0; i < number_of_tables ; i++) {
    result_table[i] = new Array();
  for (var d = 0; d < data_object.demands.length; d++){
    result_table[i][d] = new Array();
    var demands = data_object.demands[d];
    var demand_volume = demands.demand_volume;

    var x = 0;
    for (var p = 0; p < demands.demand_path_list.length - 1; p++) {

      var random = Math.floor((Math.random() * demand_volume) + 0.5);

      result_table[i][d][p] = 0;

      if(p == 0){
        result_table[i][d][p] = random;
        x = x + random;
      }
      else {
        if(p != (demands.demand_path_list.length - 2)){
          if(x >= demand_volume)
            continue;
          result_table[i][d][p] = (random-x >= 0) ? (random-x) : 0;
          x = x + result_table[i][d][p];
        }
        else {
            if(x >= demand_volume)
              continue;

              result_table[i][d][p] = demand_volume - x;
          }
        }
      }


  }

  }
return result_table;
}


var solve = function (algorithm, data_object, result_table) {

var F = new Array();
  var k = 0;
  for(const [index, table] of result_table.entries()){
  var link_comp = link_computation(data_object, table);
  var link_comp_array = link_comp[0];
  var link_load_array = link_comp[1];
  var max_overload = new Array();

    //for(var e = 0; e < data_object.links.length; e++) {
      for (var l = 0; l < link_comp_array.length; l++){
  //      console.log(link_comp_array[l]);

        max_overload.push(Math.max(0, link_comp_array[l] -  2*72));

      }
  //  }

      F[index] = Math.max(...max_overload);

  //    console.log(F);
  if(algorithm == "bruteforce") {
    if(F == 0) {
      create_result_file(table, link_comp_array, link_load_array);
      return;
    }
  } else if (algorithm == "evolution") {

    // if(F <= 5) {
    //   create_result_file(table, link_comp_array, link_load_array);
    //   return;
    // }
    console.log(F);

  }


  }

}

 var create_result_file = function(result_table, link_comp_array, link_load_array) {

    let writeStream = fs.createWriteStream('bruteforce.txt');
    var output = '';

    //number_of_links
    writeStream.write(link_comp_array.length + "\n", 'utf8');

    //link_load_list
    for (var link_id = 0; link_id < link_comp_array.length; link_id++) {
        writeStream.write((link_id+1) + " " + link_load_array[link_id] + " " + link_comp_array[link_id] + "\n", 'utf8');
    }

    //demand part
      writeStream.write("\n" + result_table.length + "\n", 'utf8');


      //demand flow list
      for (var demand_id = 0; demand_id < result_table.length; demand_id++) {
          writeStream.write((demand_id+1) + " " + result_table[demand_id].length + "\n", 'utf8');

          for (var path_id = 0; path_id < result_table[demand_id].length; path_id++) {
              writeStream.write((path_id+1) + " " + result_table[demand_id][path_id] + "\n", 'utf8');


          }
          writeStream.write("\n", 'utf8');

      }

  writeStream.on('finish', () => {
      console.log('wrote all data to file');
  });
  writeStream.end();


}

var evolution = function (input_table) {
  input_table = shuffle(input_table);
  var table1 = input_table.slice(0, input_table.length/2 - 1);
  var table2 = input_table.slice(input_table.length/2, input_table.length);


  var p = 0.5;
  var p_cross = 0.3; // @TODO
  var p_mutate = 0.04; //@TODO

  var result_table = new Array();
  //result_table = input_table;

for (var i = 0; i < table1.length; i++) {
  var rand = Math.random();

  if (rand <= p_cross) {
    result_table.push(cross(table1[i], table2[i]));
  }

  if (rand <= p_mutate) {
  rand = Math.random();
    if (rand <= p){
      result_table.push(mutate(table1[i]));
    }
    else {
      result_table.push(mutate(table2[i]));
    }
  }

 }
 // console.log(result_table);
 return result_table;
}



var cross = function (table1, table2) {
  var p_cross = 0.5;

  var table_result = new Array();

  for (var d = 0; d<table1.length; d++){

    var path_1 = table1[d];
    var path_2 = table2[d];

    if (rand >= p_cross) {
      table_result[d] = path_1;
    } else {
      table_result[d] = path_2;
    }

  }
  return table_result;
}

var mutate = function (table) {
  var p_mutate = 0.5;

  var table_result = new Array();

  for (var d = 0; d < table.length; d++){
    var rand = Math.random();
    var path = table[d];

    if (rand <= p_mutate) {
      table_result[d] = shuffle(path);
    } else {
      table_result[d] = path;
    }

  }

    return table_result;
}









function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function removeSmallest(arr) {
    var min = Math.min(...arr);
    return arr.filter(e => e != min);
}
