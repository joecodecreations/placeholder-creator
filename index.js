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

  var pageObjects = new Array(); //holds the line numbers start and end for each object on the page


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

    /* we have completed an object */
    if(openAndNotClosedCaryOver==0){
    //  console.log('line:'+j+'-Completed object');
    }

    /* we have closed a child bracket */
    if(openAndNotClosed < 0){

      //Get the last line number our array started
      var closedLineNumber = (lineNumbersOpenBrackets[lineNumbersOpenBrackets.length-1]);
      lineNumbersOpenBrackets.pop(); //remove it from the list now that it has been clsoed;
      //console.log('line:'+j+'-Closed Inner Bracket which started on line '+closedLineNumber);

      /* now lets log our object details for later use */
      var objectLineStart = closedLineNumber; // the line that started the object
      var objectLineEnd = j;   //the line that ended the object

      /* we will set the bounds for our code for this object, if it changes lower, this will get updated */
      var codeStartLine = objectLineStart;
      var codeEndline = objectLineEnd;

      /* check the place in the line where the first occurance of { started */
      var index = allLines[objectLineStart-1].indexOf('{');

      var characterBefore = allLines[objectLineStart-1].substr(index-1,index-1); //grab the character directly before the {
      if(characterBefore == "#"){
        //we have a dynamic variable in scss so let's grab the next occurance of the item
        index = getPosition(allLines[objectLineStart-1], "{", 2);
      }

      // if we found something
      if(index>0){
          var className = trimCode(allLines[objectLineStart-1].substr(0,index));
      }

      //If we still don't have a class
      if(className==""){

        var tries = 0; //stores the number of tries
        var attempts = 5; //how many many lines back do we want to check

        //until we reach our attempts or until we find a class name
        while(className=="" && tries<attempts){
          tries++;
          //set line to try equal to where we started minus each new line try
          var lineAttempt = objectLineStart-1-tries;
          //if we are still within the page bounds
          if(lineAttempt>=0){
              //check the entire line, if it has something
              if(trimCode(allLines[lineAttempt])!=""){

                //set our class name to it
                className = trimCode(allLines[lineAttempt]);

                //update our code starting point as well so we include it in it's entirety later on
                codeStartLine = lineAttempt;

              }
          }
        }
        //if are going off the page or we have gone over our attempts then we haven't found anything still
       className="Not Found";

      }
      //add our page object information
      // Class Name, Object start and end, Entire code section
      pageObjects.push([className, objectLineStart, objectLineEnd, codeStartLine, codeEndline]);

    } //if not opened or closed

    /* we started a new object*/
    if(openAndNotClosed >= 1){
    //  console.log('line:'+j+'-we opened an object that was not completed');
      lineNumbersOpenBrackets.push(j);
    }



    /* regular line item */
    if(openBrackets==0 && closedBrackets==0){
    //  console.log('line:'+j+'-no bracket activity');
    }

  }

  //console.log(lineNumbersOpenBrackets); // show our array of numbers where objects started should be zero becaue we are removing them

  //console.log(result);

  /* show total number of open brackets in this file */
//  console.log('openBrackets:'+totalOpenBrackets);

  /* show total number of closed brackets in this file */
//  console.log('closedBrackets:'+totalClosedBrackets);

  /* Are all brackets closed on this page ? */
  var unclosedBrackets = (totalOpenBrackets + totalClosedBrackets)%2==1;
//  console.log("Are there any open brackets?:"+unclosedBrackets);

  //console.log(pageObjects);


  pageObjects.forEach(function(item){

    var className = item[0],
    objectLineStart = item[1],
    objectLineEnd = item[2],
    codeStartLine = item[3],
    codeEndline = item[4];

//console.log("LINE:"+className+":"+objectLineStart+":"+objectLineEnd+":"+codeStartLine+":"+codeEndline);
    var objectCode = "";

    for(var linekeeper = codeStartLine; linekeeper < codeEndline; linekeeper++){
       //check for commented out lines
        //first two characters in line
         var firstTwoCharacters = trimWhitespace(allLines[linekeeper-1]).substr(0,2);
      //   console.log(firstTwoCharacters);
       if(firstTwoCharacters!="//"&&firstTwoCharacters!="*/"){
         //if this line isn't commented out let's add it
         objectCode = objectCode + allLines[linekeeper];

      }
      if(firstTwoCharacters=="//"||firstTwoCharacters=="*/"){
        console.log(firstTwoCharacters+" detected on Line: "+linekeeper);
        console.log("i will not print twice "+i);
      }


    } //end for loop



          //This now contains our code for this object
          //console.log("ClassName:"+className+"\n\n"+objectCode);

          //take out spaces
          var newobjectcode = trimWhitespace(objectCode);



        //  console.log(newobjectcode);


  });

  //console.log(success); //show us our success message from promise
},
function(errorResponse) {
     console.log(error);
});




/* FINAL USAGE BELOW */

/* Grabs each line of a file that is sent through */
function grabLines(filename, callback){

  /*
    Grabs each line of a file that is sent through

    grabLines("./testFile.scss", function(line){
    console.log('Our Line:' + line);
   });

   */

  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(filename)
  });

  lineReader.on('line', function (line) {
    //console.log('Line from file:', line);
    callback(line);
  });

}


function trimCode(string){
  /*
    Used to remove unwanted spaces but leave in what we need for parsing code blocks
  */
  string = string.replace(/[^-A-Za-z0-9\s!"#$%&'()*+,./:;<=>?@[\]-^{|}~]/g, "");
  return(string);
}

function trimWhitespace(string){
  string = string.replace(/(\r\n|\n|\r|\t|\s|{|})/g,"");
  return(string);
}


function getPosition(string, subString, index) {
  /*
    Find instance positions string to string.
    USE: getPosition(stringToCheck, LookingFor, WhichInstance)
  */
   return string.split(subString, index).join(subString).length;
}
