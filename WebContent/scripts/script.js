var id=0;
var queryPermutations= [];
var allQueryPermutations = 0;

var wordnet = [];
var tags = [];
var queryTemplates = {};
var parsetAdata = [];
var parsetBdata = [];
var icicle;

var selectedTemplateID = "",selectedColumnAID = "",selectedColumnBID= "";
var columnAelements= [], columnBelements= []; 
var displayParsetsOn = false; //start with parallel-sets functionality off

d3.csv("data/qsp1.csv", function(d){
	id= id+1;	
	var toReturn =  {
		qspid : id,
	    count : +d.count,
	    template : d.template,
	    columnA : parseColumnSemantics( d.columnA, 1),
	    columnB : parseColumnSemantics( d.columnB, 2)
	  };	
	  return toReturn;
	  }, function(data) {
		$("#loader").append("<br>- Loaded data/qsp1.csv")
		$("#loader").append("<br>- Processed data/qsp1.csv")
		queryPermutations = data;
		
		$.each(queryPermutations, function(ind, qp){
			allQueryPermutations+=qp.count;
		}) 
		$.get("data/wordsemantics-2.20-json.txt",function(txt){
			$("#loader").append("<br>- Loaded data/wordsemantics-2.20-json.txt")

			processSemanticTxt(txt);

			$("#loader").append("<br>- Processed data/wordsemantics-2.20-json.txt")
			$.get("data/templateQC.txt",function(txt){
				$("#loader").append("<br>- Loaded data/templateQC.txt")

			    var lines = txt.split("\n");
			    for (var i = 0, len = lines.length; i < len; i++) {
			    	line = lines[i];
			    	var res = line.split(",");
			    	queryTemplates[res[1]] = {}
			    	queryTemplates[res[1]].count = res[0];
			    	queryTemplates[res[1]].text = res[2];
			    }				
				$("#loader").append("<br>- Processed data/templateQC.txt")
				
				$("#loader").css( "display","none");	
				$("#interface").css( "display","block");

				displayTemplates(data);
				
				console.log("Displayed Templates")
				
				populateColumn(data, 'columnA');
				populateColumn(data, 'columnB');
				populateSemanticsBrowser();
				populateTagsBrowser();
				
				$('#templateList').on('click', 'li', function() {
					
				    if(selectedTemplateID == this.id){	//i am deselecting a template
				    	selectedTemplateID= '';
				    	$('.templatetext').hide();
						displayTemplates(data);//recalculate query counts
				    }
				    else{//i'm selecting a template that was not selected
				    	selectedTemplateString = this.getAttribute('text');
					    $('.templatetext').show();
					    $('#selectedTemplate2').empty();
					    $('#selectedTemplate2').append(selectedTemplateString.slice(selectedTemplateString.indexOf("X")+1, selectedTemplateString.indexOf("Y")));
					    
					    $('#selectedTemplate3').empty();
					    $('#selectedTemplate3').append(selectedTemplateString.slice(selectedTemplateString.indexOf("Y")+1, selectedTemplateString.length-1));

					    selectedTemplateID = this.id;
					    $(this).children().filter('.templatevalue').text(this.getAttribute('text').slice(0, this.getAttribute('text').indexOf("X")));
					    $('#templateList li').removeClass( 'selectedListElement' );
					    $(this).toggleClass('selectedListElement');
				    }
				    			    
				    $("#columnAsemanticExplorer").hide();
					$("#columnAlist").show();
				    $("#columnBsemanticExplorer").hide();
					$("#columnBlist").show();
					
				    populateColumn(data, 'columnA');
				    populateColumn(data, 'columnB');
				    displayQueries("", "");
				});
				
				$(document).on("click", "#columnAlist .semanticlistelement", function() {
				    $("input[name='columnAparallelsets']").prop('checked', false);

						if(selectedColumnAID == this.getAttribute('uid')){//i am deselecting me, reset everything.
							abstractionLevel = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnAID;
							})[0].abstractionLevel;
							$('#columnAlist'+selectedColumnAID).css('background', 'rgba(70,130,180,'+ 1/abstractionLevel +	')');
							$('#columnAlist'+selectedColumnAID+ ' .drilldown').empty();
							$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').empty();

							selectedColumnAID = "";
						}
						else{
							if(selectedColumnAID!=""){
								abstractionLevel = _.select(wordnet, function (obj) {
									  return obj.uid === selectedColumnAID;
								})[0].abstractionLevel;
								$('#columnAlist'+selectedColumnAID).css('background','rgba(70,130,180,'+ 1/abstractionLevel +	')');
								$('#columnAlist'+selectedColumnAID+ ' .drilldown').empty();
								$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').empty();

							}
							//update selected semantic
							selectedColumnAID = this.getAttribute('uid');
							$('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
							$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
							$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
						}
						displayQueries("columnA", selectedColumnAID);
						displayTemplates(data);
						
						populateColumn(data, 'columnB');
						if(selectedColumnAID!=""){
							semobject = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnAID;
							})[0];
							displayParsets(semobject, "columnA", true);
						}
				});
				$(document).on("click", "#columnAlist .inspect", function(){
					$('#colAprompt').append('<button id="backTocolumnA" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnAID, 'columnA', false);
					displayQueries("columnA", selectedColumnAID);
				});
				$(document).on("click", "#columnBlist .inspect", function(){
					$('#colBprompt').append('<button id="backTocolumnB" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnBID, 'columnB', false);
					displayQueries("columnB", selectedColumnBID);
				})
				$(document).on("click", "#columnAlist .showicicles", function(){
					$('#colAprompt').append('<button id="backTocolumnA" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnAID, 'columnA', true);
					displayQueries("columnA", selectedColumnAID);
				});
				$(document).on("click", "#columnBlist .showicicles", function(){
					$('#colBprompt').append('<button id="backTocolumnB" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnBID, 'columnB', true);
					displayQueries("columnB", selectedColumnBID);
				})
				$(document).on("click", "#columnBlist .semanticlistelement", function() {
					//i'm just deselecting the element
					if(selectedColumnBID == this.getAttribute('uid')){
						abstractionLevel = _.select(wordnet, function (obj) {
							  return obj.uid === selectedColumnBID;
						})[0].abstractionLevel;
						$('#columnBlist'+selectedColumnBID).css('background', 'rgba(70,130,180,'+ 1/abstractionLevel +	')');
						$('#columnBlist'+selectedColumnBID+ ' .drilldown').empty();
						$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').empty();
						selectedColumnBID = "";
					}
					//I clicked an element to select it
					else{
						if(selectedColumnBID!=""){
							abstractionLevel = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnBID;
							})[0].abstractionLevel;
							$('#columnBlist'+selectedColumnBID).css('background','rgba(70,130,180,'+ 1/abstractionLevel +	')');
							$('#columnBlist'+selectedColumnBID+ ' .drilldown').empty();
							$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').empty();
						}
						//update selected semantic
						selectedColumnBID = this.getAttribute('uid');

						$('#columnBlist'+selectedColumnBID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
						$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');

						$('#columnBlist'+selectedColumnBID).css('background', 'yellow');
					}

				    populateColumn(data, 'columnA');		    
				    if(selectedColumnAID!=""){
					    $('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
					    $('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
						$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
					}
					displayTemplates(data);
				    displayQueries("columnB", selectedColumnBID);
				    if(selectedColumnBID!=""){
						semobject = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnBID;
							})[0];
					    displayParsets(semobject, "columnB", true);
				    }
				});
				$(document).on("keyup","#columnAfilter", function () {

		            var rex = new RegExp($(this).val(), 'i');
		            $('#columnAcontainer .searchable tr').hide();
		            $('#columnAcontainer .searchable tr').filter(function () {
		                return rex.test($(this).text());
		            }).show();

		        });
				$(document).on("keyup","#columnBfilter", function () {

		            var rex = new RegExp($(this).val(), 'i');
		            $('#columnBcontainer .searchable tr').hide();
		            $('#columnBcontainer .searchable tr').filter(function () {
		                return rex.test($(this).text());
		            }).show();

		        })
		        
		        $(document).on("keyup","#semanticsbrowserfilter", function () {

		            var rex = new RegExp($(this).val(), 'i');
		            $('#semanticsbrowser .searchable tr').hide();
		            $('#semanticsbrowser .searchable tr').filter(function () {
		                return rex.test($(this).text());
		            }).show();

		        })
		          $(document).on("keyup","#tagsbrowserfilter", function () {

		            var rex = new RegExp($(this).val(), 'i');
		            $('#tagsbrowser .searchable tr').hide();
		            $('#tagsbrowser .searchable tr').filter(function () {
		                return rex.test($(this).text());
		            }).show();

		        })
				$(document).on("click", "#backToTemplate", function(){
					$('#templateList').show();
					$('.templatetext').hide();
				});

				
				$(document).on("click", "#backTocolumnA", function(){
					$("#columnAsemanticExplorer").empty();
					$("#columnAsemanticExplorer").hide();
					$("#columnAcontainer").show();
					$("#backTocolumnA").remove();
					selectedColumnAID =	document.querySelector("#columnAlist .inspect").parentElement.getAttribute("uid");
					semobject = _.select(wordnet, function (obj) {
						  return obj.uid === selectedColumnAID;
					})[0];
					displayParsets(semobject, "columnA", true);
					displayQueries("columnA", selectedColumnAID);
				});
				
				$(document).on("click", "#backTocolumnB", function(){
					$("#columnBsemanticExplorer").empty();
					$("#columnBsemanticExplorer").hide();
					$("#columnBcontainer").show();
					$("#backTocolumnB").remove();
					selectedColumnBID = document.querySelector("#columnBlist .inspect").parentElement.getAttribute("uid");
					semobject = _.select(wordnet, function (obj) {
						  return obj.uid === selectedColumnBID;
					})[0];
					displayParsets(semobject, "columnB", true);
					displayQueries("columnB", selectedColumnBID);

				});
				$(document).on("change","input[type='checkbox']",function() {
				    if(this.checked) {
				        //Do stuff
				    	console.log($(this).prop("value"));
				    	columnName = this.parentElement.getAttribute("column");
				    	semanticid = $(this).prop("value");
				        addToParsetData(semanticid, columnName, 10);
				        semobject = _.select(wordnet, function (obj) {
							  return obj.uid === semanticid;
						})[0];
				        displayParsets(semobject, columnName, false);
				    }
				});
			});
		});
});//end loading data

function displayParsets(d, position, reset){
	var semanticid = d.uid;
	$("#"+position+"parset").empty();
	//prep the data for parallel sets
	if(reset){
		if(position=="columnA")
			parsetAdata=[];
		else if(position=="columnB")
			parsetBdata=[];
		addToParsetData(semanticid, position, 10);
	}
    
    var svg = d3.select("#"+position+"parset").append("svg")
	.attr("id", "#"+position+"parsetsvg")
	.attr("width", "90%")
	.attr("height", 450);
    
    var margin = {top: 0, right: 25, bottom: 50, left: 0};
    var width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    console.log(width+", "+height);
	var chart = d3.parsets().dimensions(["ColumnX","ColumnY"]).width(width).height(height);				

	var vis = svg.append("g")
	.attr("id", position+"parset")
//     .attr("width", width + margin.left + margin.right)
//    .attr("height", height + margin.top + margin.bottom)
	.attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,"+(width + margin.left + margin.right)+")rotate(-90)");//this is correct. 
	
	if(position=="columnA")
		vis.datum(parsetAdata).call(chart);	
	else if(position=="columnB")
		vis.datum(parsetBdata).call(chart);
    
	vis.selectAll(".category text")
    .attr("dx", 5)
    .attr("transform", "rotate(90)");
	
	vis.selectAll(".category rect")
    .attr("y", 0);
	
	vis.selectAll("text.dimension")
    .attr("dy", "1.5em")
    .attr("transform", "rotate(90)");
	
	vis.selectAll("text.dimension .sort.alpha")
    .attr("x", 0)
    .attr("dx", 0)
    .attr("dy", "1.5em");
	
	 vis.selectAll("text.dimension .sort.size")
    .attr("dx", "1em");
	
}
function snoopForLeaves(leafArray, parent){
	kids = parent.derivedFrom;
	if(kids)
		$.each(kids, function(index, value){
			if(value.indexOf("wordnet_")!=-1){
				var childSemantics = _.select(wordnet, function (obj) {
					  return obj.uid === value;
					})[0];
				
				if(childSemantics.abstractionLevel == 1){
					leafArray.push(childSemantics);
				}
				else{
					snoopForLeaves(leafArray, childSemantics);
				}
			}
		})
}
function addToParsetDataFull(semantic, column, topK ){
	//get all leafs of the semantic type in question
	var leafArray = []
	var parent = _.select(wordnet, function (obj) {
		  return obj.uid === semantic;
		})[0];
	snoopForLeaves(leafArray, parent);
	
	var filtereddata = queryPermutations;
	var k = 0;
	//filter on template if one is selected
	if(selectedTemplateID!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == selectedTemplateID;
		});
	}
	//filter all query permutations that have the LEAF semantic types
	filtereddata = filtereddata.filter(function( obj ) {
	    return $.inArray(obj[column].id, leafArray)!=-1;
	});
	//sort all filtered query permutations
	listelements = _.sortBy(filtereddata, function(element){ return - element.count;})
	
	
	if(column == "columnA"){
		var semanticType = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0];
		// get the label of the semantic type user is looking at
		var semanticXlabel = semanticType.label;
//		var children = semanticType.derivedFrom;

		//for all filtered query permutations, record the top K combinations 
		$.each(listelements, function(key, value){
			if(k<topK){
				var filter = _.select(wordnet, function (obj) {
					  return obj.uid === value.columnB.id;
				});
				if(filter.length!=0){
						semanticYlabel = filter[0].label;
						
						
					for(var ind= 0; ind<value.count; ind++){			
						parsetelement = {}
						parsetelement.ColumnX = semanticXlabel 
						parsetelement.ColumnY = semanticYlabel;
						if(column=="columnA")parsetAdata.push(parsetelement);
						else if(column=="columnB")parsetBdata.push(parsetelement);
					}
					k++
				}
			}else {
				return false;
			}
		});
	}
	else if (column == "columnB"){
		semanticYlabel = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0].label;

		$.each(listelements, function(key, value){
			if(k<topK){
				semanticXlabel = _.select(wordnet, function (obj) {
					  return obj.uid === value.columnA.id;
				})[0].label;
				for(var ind= 0; ind<value.count; ind++){			
					parsetelement = {}
					parsetelement.ColumnX = semanticXlabel 
					parsetelement.ColumnY = semanticYlabel;
					if(column=="columnA")parsetAdata.push(parsetelement);
					else if(column=="columnB")parsetBdata.push(parsetelement);
				}
			k++
			}else {
				return false;
			}
		});
	
	}
}

function addToParsetData(semantic, column, topK ){
	var filtereddata = queryPermutations;
	var k = 0;
	//filter on template if one is selected
	if(selectedTemplateID!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == selectedTemplateID;
		});
	}
	//filter all query permutations that have the semantic type in question
	filtereddata = filtereddata.filter(function( obj ) {
	    return obj[column].id == semantic;
	});
	//sort all filtered query permutations
	listelements = _.sortBy(filtereddata, function(element){ return - element.count;})
	
	
	if(column == "columnA"){
		// get the label of the semantic type user is looking at
		semanticXlabel = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0].label;
		//for all filtered query permutations, record the top K combinations 
		$.each(listelements, function(key, value){
			if(k<topK){
				var filter = _.select(wordnet, function (obj) {
					  return obj.uid === value.columnB.id;
				});
				if(filter.length!=0){
						semanticYlabel = filter[0].label;
					for(var ind= 0; ind<value.count; ind++){			
						parsetelement = {}
						parsetelement.ColumnX = semanticXlabel 
						parsetelement.ColumnY = semanticYlabel;
						if(column=="columnA")parsetAdata.push(parsetelement);
						else if(column=="columnB")parsetBdata.push(parsetelement);
					}
					k++
				}
			}else {
				return false;
			}
		});
	}
	else if (column == "columnB"){
		semanticYlabel = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0].label;

		$.each(listelements, function(key, value){
			if(k<topK){
				semanticXlabel = _.select(wordnet, function (obj) {
					  return obj.uid === value.columnA.id;
				})[0].label;
				for(var ind= 0; ind<value.count; ind++){			
					parsetelement = {}
					parsetelement.ColumnX = semanticXlabel 
					parsetelement.ColumnY = semanticYlabel;
					if(column=="columnA")parsetAdata.push(parsetelement);
					else if(column=="columnB")parsetBdata.push(parsetelement);
				}
			k++
			}else {
				return false;
			}
		});
	
	}
}
function truncateText(text, width) {
    return function(d, i) {
      var t = this.textContent = text(d, i),
          w = width(d, i);
      if (this.getComputedTextLength() < w) return t;
      this.textContent = "…" + t;
      var lo = 0,
          hi = t.length + 1,
          x;
      while (lo < hi) {
        var mid = lo + hi >> 1;
        if ((x = this.getSubStringLength(0, mid)) < w) lo = mid + 1;
        else hi = mid;
      }
      return lo > 1 ? t.substr(0, lo - 2) + "…" : "";
    };
  }
function loadQTC(filename){
	var qtc = {}; 
	$.get(filename,function(txt){
	    var lines = txt.split("\n");
	    for (var i = 0, len = lines.length; i < len; i++) {
	    	line = lines[i];
	    	var res = line.split(" ");	    	
	    	qtc[res[1]] = res[0];
	    }
	    return qtc;
	});	
}
function countAllQueriesOfSemType(semtype, position){
	var count = 0;
	$.each(semtype.queryStats, function(ind, val){
		if(Object.keys(val)[0].endsWith(position))
			count+=val[Object.keys(val)[0]]
	});
	return count;
}

function populateTagsBrowser(){
	$('#tagsbrowser').empty();
	$('#tagsbrowser').append('<div style="padding-bottom:10px;">'+
			'<div class="input-group" id="inputtagsbrowser"> '+
			'<span class="input-group-addon">Filter</span>'+			
	'<input id="tagsbrowserfilter" type="text" class="form-control" placeholder="Type here...">	'+
	'</div></div>'+'<table class = " table table-striped " id = "alltagstable"><thead><tr>'+
	'<th>Complete<br>Query Count</th><th>ColumnX<br>Query Count</th><th>ColumnY<br>Query Count</th> <th>Tag</th>'+
	'</tr></thead><tbody class="searchable " id ="tagsbrowsertable"></tbody></table>');
	var tablebody = $('#tagsbrowsertable')
	$.each(tags, function( index, value) {
		
		countsA =  countAllQueriesOfSemType(value, 1);
		countsB =  countAllQueriesOfSemType(value, 2);
		tablebody.append('<tr ><td>'+(countsA+countsB)+'</td><td>'+countsA+'</td><td>'+countsB+'</td><td>'+value.label+' </td></tr>');
	});
	
	$(function(){
		  $('#alltagstable').tablesorter({sortList: [[0,1]]} ); 
		});
}

function populateSemanticsBrowser(){
	$('#semanticsbrowser').empty();
	$('#semanticsbrowser').append('<div style="padding-bottom:10px;">Abstraction: <br> '+
			'<div id="semanticsbrowserabstraction" class= "abstractionslider" name ="Abstraction"></div>'+
			'<div class="input-group" id="inputsemanticsbrowser"> '+
			'<span class="input-group-addon">Filter</span>'+			
	'<input id="semanticsbrowserfilter" type="text" class="form-control" placeholder="Type here...">	'+
	'</div></div>'+'<table class = " table table-striped " id = "allsemanticstable"><thead><tr>'+
	'<th>Complete<br>Query Count</th><th>ColumnX<br>Query Count</th><th>ColumnY<br>Query Count</th> <th>SemanticType</th>'+
	'</tr></thead><tbody class="searchable " id ="semanticsbrowsertable"></tbody></table>');
	var tablebody = $('#semanticsbrowsertable')
	$.each(wordnet, function( index, value) {
		
		countsA =  countAllQueriesOfSemType(value, 1)
		countsB =  countAllQueriesOfSemType(value, 2);
		tablebody.append('<tr style="background:rgba(70,130,180,'+ 1/value.abstractionLevel +
				'); " abstraction="'+
				value.abstractionLevel+'"><td>'
				+(((countsA+countsB) *100)/allQueryPermutations).toFixed(4)+' % </td><td>'+(countsA+countsB)+'</td><td>'+countsA+'</td><td>'+countsB+'</td><td>'+value.label+' </td></tr>');
	});
	
	
	$("#semanticsbrowserabstraction").slider({
		range:true,
        values:[1,8],
        min: 1,
        max: 8,
        step: 1,
        slide: function( event, ui ) {
			var selected = ui.values;
			$('#semanticsbrowserabstraction .ui-slider-range').css('background','linear-gradient(to right, rgba(70,130,180,'+1/selected[0]+'), rgba(70,130,180,'+1/selected[1]+'))');

			var table = document.getElementById("semanticsbrowsertable");
	        for (var i = 1, row; row = table.rows[i]; i++) {
			  if( row.getAttribute("abstraction")>=selected[0] && row.getAttribute("abstraction")<=selected[1])
				  $(row).show();
			  else
				  $(row).hide();
			}
        }
	})
	.each(function() {
		 // Add labels to slider whose values 
	    // are specified by min, max
	    // Get the options for this slider (specified above)
	    var opt = $(this).data().uiSlider.options;
	    // Get the number of possible values
	    var vals = opt.max - opt.min;
	    // Position the labels
	    for (var i = 0; i <= vals; i++) {
	        // Create a new element and position it with percentages
	        var el = $('<label>' + (i + opt.min) + '</label>').css('left', (i/vals*100) + '%').css('margin-top','15px');
	        // Add the element inside #slider
	        $("#semanticsbrowserabstraction").append(el);
	    }
	});	
	$('#semanticsbrowserabstraction .ui-slider-range').css('background','linear-gradient(to right, rgba(70,130,180,1), rgba(70,130,180,'+1/8+'))');
	$(function(){
		  $('#allsemanticstable').tablesorter({sortList: [[0,1]]}); 
		});
}

function populateColumn(data, column){
	console.log("Populating column "+column)
	$('#'+column+'container').empty();
	$('#'+column+'container')
	.append('<div style="padding-bottom:10px;">Abstraction: <br> '+
			'<div id="'+column+'abstraction" class= "abstractionslider" name ="Abstraction"></div>'+
			'<div class="input-group" id="input'+column+'"> '+
			'<span class="input-group-addon">Filter</span>'+			
	'<input id="'+column+'filter" type="text" class="form-control" placeholder="Type here...">	</div></div>'+
	'<div class = "scrollable"><table class="table table-striped semanticlist" id="'+column+
	'table" ><tbody class="searchable" id="'+column+'list"></tbody></table></div>');
	
	$('#'+column+'list').empty();
	
	var listelements = []
	var minQueryCount= 0, maxQueryCount= 0;
	$.each(wordnet, function( index, value) {
		var element = {};
		element.semobject = value;
		if(selectedTemplateID!="")
			element.querycount = fetchQC(value.uid,column, selectedTemplateID)
		else{
			if (column=="columnA")element.querycount  =  countAllQueriesOfSemType(value, 1)
			else if (column=="columnB")element.querycount  =  countAllQueriesOfSemType(value, 2);
			}
		if(element.querycount<minQueryCount)minQueryCount = element.querycount;
		if(element.querycount>maxQueryCount)maxQueryCount = element.querycount;
		listelements.push(element)
	});
	
	listelements = _.sortBy(listelements, function(element){ return - element.querycount;})

	if(column =="columnA"){columnAelements = listelements;}
	else if(column == "columnB"){columnBelements = listelements;}
	abstractions = [];
	
	var columnlist = $('#'+column+'list');
	var columnlisthtml = "";
	var fontscale = d3.scale.linear()
	.domain([minQueryCount, maxQueryCount])
	.range([10, 30]);
	
	$.each(listelements, function( index, element) {
		if($.inArray(element.semobject.abstractionLevel, abstractions) == -1){
			abstractions.push(element.semobject.abstractionLevel);
		}
		thislabel= element.semobject.label;
		if(!isNaN(element.querycount)){
			columnlisthtml = columnlisthtml+'<tr id="'+column+'list'+element.semobject.uid+'" uid="'+element.semobject.uid+'" abstraction="'+
					element.semobject.abstractionLevel+'" qspCol="'+thislabel+
					'"  style="background:rgba(70,130,180,'+ 1/element.semobject.abstractionLevel +
					'); "><td column="'+column+'"><input type="checkbox" name="'+column+'parallelsets" value="'+
					element.semobject.uid+'"> </td><td>'
					+((element.querycount *100)/allQueryPermutations).toFixed(4)+' % </td><td><span class="badge" >'
					+element.querycount+'</span></td><td uid="'+element.semobject.uid+
					'" class="doubledrilldown"></td><td uid="'+element.semobject.uid+
					'" class="drilldown"></td><td class=" semanticlistelement" uid="'+element.semobject.uid+
					'"  style="font-size:'+fontscale(element.querycount)+'px;" >'+
		      thislabel+'</td></tr>';
		}
  	});
	columnlist.append(columnlisthtml);
	
	
	$("#"+column+"abstraction").slider({
		range:true,
        values:[1,8],
        min: 1,
        max: 8,
        step: 1,
        slide: function( event, ui ) {
			var selected = ui.values;
			$('#'+column+'abstraction .ui-slider-range').css('background','linear-gradient(to right, rgba(70,130,180,'+1/selected[0]+'), rgba(70,130,180,'+1/selected[1]+'))');

			var table = document.getElementById(column+"table");
	        for (var i = 1, row; row = table.rows[i]; i++) {
			  if( row.getAttribute("abstraction")>=selected[0] && row.getAttribute("abstraction")<=selected[1])
				  $(row).show();
			  else
				  $(row).hide();
			}
        }
	})
	.each(function() {
		 // Add labels to slider whose values 
	    // are specified by min, max
	    // Get the options for this slider (specified above)
	    var opt = $(this).data().uiSlider.options;
	    // Get the number of possible values
	    var vals = opt.max - opt.min;
	    // Position the labels
	    for (var i = 0; i <= vals; i++) {
	        // Create a new element and position it with percentages
	        var el = $('<label>' + (i + opt.min) + '</label>').css('left', (i/vals*100) + '%').css('margin-top','15px');
	        // Add the element inside #slider
	        $("#"+column+"abstraction").append(el);
	    }
	});	
	$('#'+column+'abstraction .ui-slider-range').css('background','linear-gradient(to right, rgba(70,130,180,1), rgba(70,130,180,'+1/8+'))');

	console.log("Finished populating column "+column);

}


function parseColumnSemantics(data, num){
	
	var columnObject = [];
	
	if(data!==undefined){	
		var objectElements = data.split(/[[\]]{1,2}/);	
		columnObject["label"] = objectElements[0];
		columnObject["id"]= objectElements[1];
		columnObject["abstractionLevel"]= objectElements[2];
		columnObject["columnCount"]= +objectElements[3];
	}
	return columnObject;
}
function displayTemplates(data){
	var uniqueEntities = _.uniq(data, function (item, key, a) {
		if((item.template).length<20 )//filter out dirty data
			return item.template;
		});
	var list = $("#templateList");
	list.empty();
	var listelements = []
	var minQueryCount= 0,maxQueryCount = 0;
	$.each(uniqueEntities, function( index, value) {
		var element = {};
		var template = value.template;
		if(queryTemplates[template]!=undefined && (queryTemplates[template].text).indexOf('Ignore')==-1){
			element.template = template;
			if(selectedColumnAID=='' && selectedColumnBID=='')
				element.templatecount = queryTemplates[template].count;
			else if (selectedColumnAID!='' && selectedColumnBID==''){
				element.templatecount = fetchQC(selectedColumnAID,'columnA',template)
			}
			else if (selectedColumnAID=='' && selectedColumnBID!=''){
				element.templatecount = fetchQC(selectedColumnBID,'columnB',template)
			}
			else if (selectedColumnAID!='' && selectedColumnBID!=''){
				
				element.templatecount = _.select(queryPermutations, function (obj) {
					  return obj.columnA.id === selectedColumnAID && obj.columnB.id === selectedColumnBID;
				})[0].count;
			}
			element.text = queryTemplates[template].text;
			listelements.push(element);	

			if(element.templatecount<=minQueryCount)
				minQueryCount = element.templatecount;
			if(element.templatecount>=maxQueryCount)
				maxQueryCount = element.templatecount;
		}
	});
	listelements = _.sortBy(listelements, function(element){ return - element.templatecount;})
	maxQueryCount = listelements[0].templatecount;
	
	var listhtml= "";
	var fontscale = d3.scale.linear()
		.domain([minQueryCount, maxQueryCount])
		.range([10, 30])
		.clamp(true);
	
	$.each(listelements, function( index, value) {
		listhtml = listhtml+ '<li class="list-group-item" id="'+value.template+'" text="'+value.text+'" permutations = "'+value.templatecount+
		'" style="font-size:'+fontscale(value.templatecount)+'px;"><span class ="badge">'+value.templatecount+'</span><span class="templatevalue">'+value.text+'</span></li>';
	});
	list.append(listhtml);
	
	console.log("Displayed templates for selectedColumnAID= '"+selectedColumnAID+"' and selectedColumnBID='"+selectedColumnBID+"'")
}



function fetchQC(uid,column,template){
	var o;
totalcount = 0;
var id;
	if(template!==""){
		if(column == "columnA")
			id = template+"_1";
		else if(column == "columnB")
			id = template+"_2";
		if(uid.indexOf('wordnet')!==-1){
			o = _.select(wordnet, function (obj) {
				  return obj.uid === uid;
				})[0];
		}
		else{//it's a tag!
			o = _.select(tags, function (obj) {
				  return obj.uid === uid;
				})[0];
		}
		
		filteredQueryStats  = (_.uniq(o.queryStats, function (item) {
			return Object.keys(item)[0]==id;
			}));
		if(filteredQueryStats[1]==undefined){
//			console.log(uid+" "+column+" "+template);
			return 0;
		}
		else{			
			return filteredQueryStats[1][id];// NO IDEA WHY TWO ARE RETURNED!!!! :/
		}	
	}
	else{
		totalcount = 0;
		if(uid.indexOf('wordnet')!==-1){
			o = _.select(wordnet, function (obj) {
			  return obj.uid === uid;
			})[0];
		}
		else{
			o = _.select(tags, function (obj) {
				  return obj.uid === uid;
				})[0];
			}
		$.each(o.queryStats, function( index, value) {
			totalcount = totalcount+value[Object.keys(value)[0]];
		});
		return totalcount;
	}
}	



function processSemanticTxt(txt){

    var lines = txt.split("\n");
    console.log(lines.length);
    for (var i = 0, len = lines.length; i < len; i++) {
    	line = lines[i];
    	if(line.length>1){
    	// check string ending
    	if(/\[\]/.test(line.substr(line.length-3, line.length-2))){
    		line = line+"}"
    	}
    	else{
    	
	    	lastindex = line.lastIndexOf('\}')
	    	//mallformed:  {[{"trend_3_3":0}, {"trend_2_1":1}
	    	if(/[0-9]+\}/.test(line.substring(lastindex-1, lastindex+1))){
	    		line = line.slice(0, -2)+'}]}';   
	    	}
	    	
	    	else if( line.substring(lastindex-2, lastindex+1) !=='[]}'){
	    		line = line.slice(0, -3)+'}]}';      		
	    	}
    	}
    	
    	//check internally
    	index0 = line.indexOf('derivedFrom');
		if(index0!=-1){
			index = line.indexOf('\]',index0);
    		if(index!=-1 && line[index-1]!=='['){
    			line = line.substr(0, index) + '"' + line.substr(index);
    		}
		}
		
		groupindex = 0;
		while(line.indexOf("\{grouping", groupindex)!==-1){
			groupindex = line.indexOf("\{grouping", groupindex);
			line = line.substr(0, groupindex+1) + '"' + line.substr(groupindex+1);
		}
    	jsonSemantics = $.parseJSON(line);
    	if((jsonSemantics.uid).indexOf('wordnet')!==-1)
    		wordnet.push(jsonSemantics);
    	else
    		tags.push(jsonSemantics);
		}
    }


 wordnet = _.sortBy(wordnet, function(o){ return - o.columnCount;})
	
}
function createLabelList(wordsemantics){
	$.each(wordsemantics, function(key, value){
		if((value.uid).indexOf('wordnet')!==-1)
			$("#wordnetlist").append('<li>'+value.label+', '+value.columnCount+'</li>');
		else{
			$("#taglist").append('<li>'+value.uid+'</li>');
		}
	});
}
function displaySemanticIcicle(uid, column, fullIcicle){
	var body = d3.select("body");
	var partitiontooltip = $("#partitiontooltip");
	 $("#"+column+"container").hide();
	 $("#"+column+"semanticExplorer").empty();
	 $("#"+column+"semanticExplorer").show();
	var fullIcicle = fullIcicle;
	var w = 600,h = 600;
	var x = d3.scale.linear().range([0, w]);
	var y = d3.scale.linear().range([0, h]);

	//create data for zoomable partition
	icicle = {}
	var semanticobject = _.select(wordnet, function (obj) {
		  return obj.uid === uid;
		});
	var key = semanticobject[0].label;
	$("#"+column+"semanticExplorer").append('<p>Displaying zoomable partition for semantic type = "'+key
			+'", with id="'+uid+'"</p>');
	
	icicle.name= key;
	icicle.uid=semanticobject[0].uid;
	icicle.abstractionLevel = semanticobject[0].abstractionLevel;
	icicle.type="wordnet";
	icicle.count = fetchQC(semanticobject[0].uid,column,selectedTemplateID);
	icicle.children= [];
	processObject(semanticobject[0], icicle.children, column, fullIcicle);
	
	var partition = d3.layout.partition()
   .value(function(d) { return d.count; });
	
	var nodes = partition.nodes(icicle);
	var root = nodes[0];
	
	var svg = d3.select("#"+column+"semanticExplorer").append("svg")
		.attr("id", column+"svg")
		.attr("width", w)
		.attr("height", h)
		.append("g")
		.attr("id", column+"partition");
	
	var g = svg.selectAll("#"+column+"partition g")
		   .data(nodes)
		   .enter()
		   .append("svg:g")
		   .attr("id", function(d) { 
			   return "partition"+column+d.uid; })
		   .attr("uid", function(d) { 
			   return d.uid; })
		   .attr("abstractionLevel", function(d) { 
		   		return d.abstractionLevel; })
		   .attr("transform", function(d) { 
		   		return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
		   .on("click", clicked)
		   .on("mouseover", function(d) { 

			      var m = d3.mouse(body.node());
			      partitiontooltip
			          .show()
			          .css("left", m[0] + 10 + "px")
			          .css("top", m[1] - 10 + "px")
			          .text(d.name +", "+d.count);
			      
//			   	if (displayParsetsOn== false)
//			   		return;
//			   	if (!d.children) 
//			   		return;
//			   	displayParsets(d, column, true);
			   	})
		   .on("mouseout",function(){
			   partitiontooltip.hide();

//			   	if (displayParsetsOn== false)
//			   		return;
//			   	d3.selectAll("#"+column+"parset").remove()
		   		});
	
	var kx = w / root.dx, ky = h / 1;
	
	g.append("svg:rect")
	.attr("uid", function(d) { return d.uid; })
    .attr("width", root.dy * kx)
    .attr("height", function(d) { return d.dx * ky; })
    .attr("class", function(d) { 
    	if(d.depth==0)
    		return "selectedListElement";
    	else
    		return d.type=="wordnet" ? "parent" : "child"; 
    	})

    .style("opacity", function(d) { return d.type=="wordnet" && d.depth!=0 ? 1/d.abstractionLevel : 1;})
    ;

    g.append("svg:text")
    .attr("uid", function(d) { return d.uid; })
    .attr("transform", transform)
    .attr("dy", ".35em")
    .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
    .text(truncateText(function(d) { return d.name +", "+d.count; }, function(d) { return root.dy * kx; }));

    d3.select(window).on("click", function() {clicked(root); })
    
    function transform(d) {return "translate(8," + d.dx * ky / 2 + ")"; }
    

    function clicked(d) {
    	
    	if($("#"+column+"semanticExplorer").css('display')=='none')return;
    	if(fullIcicle){
        	
    		if (!d.children) return;
    		
            kx = (d.y ? w - 40 : w) / (1 - d.y);
            ky = h / d.dx;
            x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
            y.domain([d.x, d.x + d.dx]);
            
            var g = svg.selectAll("#"+column+"partition g");
            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

            t.select("rect")
                .attr("width", d.dy * kx)
                .attr("height", function(d) { 
                	return d.dx * ky; });

            t.select("text")
                .attr("transform", transform)
                .style("opacity", function(d) { 
                	return d.dx * ky > 12 ? 1 : 0; });
              d3.event.stopPropagation();
              
              if(column == "columnA"){
            	  selectedColumnAID = d.uid;
            	  populateColumn(queryPermutations, 'columnB');
              }

              else if(column == "columnB"){
            	  selectedColumnBID = d.uid
            	  populateColumn(queryPermutations, 'columnA');
              }
    	}
    	else{
	    	displaySemanticIcicle(d.uid, column, false);
	    	d3.event.stopPropagation();
	        if(column == "columnA"){
	       	 	selectedColumnAID = d.uid;
	       	 	populateColumn(queryPermutations, 'columnB');
	        }
	
	        else if(column == "columnB"){
	        	selectedColumnBID = d.uid
	       		populateColumn(queryPermutations, 'columnA');
	        }  
	        displayParsets(d, column, true);
    	}
    }	
}



function processObject(parent, parentIcicle, column, fullicicle){
//this version only goes down depth 1
	$.each(parent.derivedFrom, function(index, value){
		var o = _.select(wordnet, function (obj) {
			  return obj.uid === value;
			});
		
		if(o.length==0){//reached a leaf (tag)
			o = _.select(tags, function (obj) {
			  return obj.uid === value;
			});
			childSemantics = o[0];
			
			var object = {};
			object.name = childSemantics.label;
			object.uid = childSemantics.uid;
			object.type = "tag";
			object.count = fetchQC(childSemantics.uid,column,selectedTemplateID);
			parentIcicle.push(object);
		}
		else{
			childSemantics = o[0];

			var arr = _.filter(parentIcicle, function(value){ 
			    if (value.name == childSemantics.label){ 
			      return value;
			    } 
			 })
			if (arr.length==0) {
					var object = {};
					object.name = childSemantics.label;
					object.uid = childSemantics.uid;
					object.abstractionLevel = childSemantics.abstractionLevel;
					object.type = "wordnet";
					object.count = fetchQC(childSemantics.uid,column,selectedTemplateID);
						
					if(fullicicle){
						object.children= [];
					}
					parentIcicle.push(object);
				}
			if(fullicicle){
				var arrobj = _.filter(parentIcicle, function(value){ 
			    if (value.name == childSemantics.label){ 
			      return value;
			    } 
			 })[0];
			
			processObject(childSemantics, arrobj.children, column, fullicicle);
				
			}

		}
	});
}

function displayQueries(column, uid){
	var examplequeries = $("#examplequeries");
	examplequeries.empty();
	examplequeries.append(selectedTemplateID+": "+column+", "+ uid);
	
}

