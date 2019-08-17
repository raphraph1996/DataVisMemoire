
export function getValueByTime(queryParams) {
  return $.get('/getValueByTime',queryParams);
}

export function getPie(queryParams){
  return $.get('/getPie',queryParams);
}

export function getLimitTimes(){
  return $.get('/getLimitTimes');
}

export function getElements(){
  return $.get('/getElements');
}

export function getDescPie(queryParams){
  return $.get('/getDescPie',queryParams);
}

export function getDescsStats(queryParams){
  return $.get('/getDescsStats',queryParams);
}
