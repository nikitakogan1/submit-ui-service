export function removeItemOnceFromArr(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
}

export default function parseTaskStatus(status){
  if (status === 0){
      return "Ready"
  } else if (status === 1){
      return "Done"
  } else if (status === 2){
      return "Assigned"
  } else if (status === 3){
      return "In progress"
  } else if (status === 4){
      return "Processing"
  } else if (status === 5){
      return "OK"
  } else if (status === 6){
      return "Timeout"
  } else {
      return "Error"
  }
}

export function parseTestState(state){
  if (state === 0){
      return "Draft"
  } else if (state === 1){
      return "In Review"
  } else {
      return "Published"
  }
}