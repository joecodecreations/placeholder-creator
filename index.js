var fs = require('fs');

// Grab the file
var path = "./testFile.scss";

// Read the file
var rawfile = fs.readFileSync(path, "utf8");

var allLines = [];

var parseFile = new Promise(function (resolve, reject) {
     //var u = asyncmethod(some_var); // <-- u is not defined, even if you return result stright, as it's the nature of async
     grabLines("./testFile.scss", function(line,err,result){

       //add each line
       allLines.push(line);

       //when we are done fulfill the promise
       if(err){
         reject("Something broke");
       } else {
         resolve("Parse File Completed");
       }

     });

});

parseFile.then(function(success, error) { //better name variables

  /*instance counting */
  var openBrackets = 0;
  var closedBrackets = 0;

  /*total count*/
  var totalOpenBrackets = 0;
  var totalClosedBrackets = 0;

  /* as we move along how many brackets remain open as we move line to line */
  var openAndNotClosed = 0;
  var openAndNotClosedCaryOver =0;

  var lineNumbersOpenBrackets = new Array(); //holds the line number of each unclosed bracket to find it later

  var j = 0; //holds code line position
  for(var i = 0; i < allLines.length; i++)
  {
      j++;
    /* counts the total number of brackets as we go on */
    totalOpenBrackets = totalOpenBrackets + allLines[i].split("{").length - 1;
    totalClosedBrackets = totalClosedBrackets + allLines[i].split("}").length - 1;

    /*counts instance of number of brackets per line */
    openBrackets = allLines[i].split("{").length - 1;
    closedBrackets = allLines[i].split("}").length - 1;

    /* difference between open and closed brackets on this line */
    openAndNotClosed = openBrackets - closedBrackets;

    /* Total count for open brackets */
    openAndNotClosedCaryOver = openAndNotClosedCaryOver +  openBrackets - closedBrackets;

    if(openAndNotClosedCaryOver==0){
      console.log('line:'+j+'-Completed object');
    }

    if(openAndNotClosed < 0){

      var closedLineNumber = (lineNumbersOpenBrackets[lineNumbersOpenBrackets.length-1]);
      lineNumbersOpenBrackets.pop();
     console.log('line:'+j+'-Closed Inner Bracket which started on line '+closedLineNumber);


    }
    if(openAndNotClosed >= 1){
      console.log('line:'+j+'-we opened an object that was not completed');
      lineNumbersOpenBrackets.push(j);
    }

    if(openBrackets==0 && closedBrackets==0){
      console.log('line:'+j+'-no bracket activity');
    }

  }
 console.log(lineNumbersOpenBrackets);
  //console.log(result);
  console.log('openBrackets:'+totalOpenBrackets);
  console.log('closedBrackets:'+totalClosedBrackets);

  var unclosedBrackets = (totalOpenBrackets + totalClosedBrackets)%2==1;
  console.log("Are there any open brackets?:"+unclosedBrackets);

  //console.log(success);
},
function(errorResponse) {
     console.log(error);
});




/* FINAL USAGE BELOW */

/* Grabs each line of a file that is sent through */
function grabLines(filename, callback){

  /* USAGE */
  // grabLines("./testFile.scss", function(line){
  //   console.log('Our Line:' + line);
  // });

  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(filename)
  });

  lineReader.on('line', function (line) {
    //console.log('Line from file:', line);
    callback(line);
  });

}
