var id=0;
var queryPermutations= [];
var wordnet = [];
var tags = [];
var queryTemplates = {};
var parsetdata = [];

var icicle;

var selectedTemplateID = "",selectedColumnAID = "";


$("#semanticExplorerPanel").hide();
d3.csv("data/qsp1.csv", function(d) {
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
		queryPermutations = data;
		$.get("data/wordsemantics-2.20-json.txt",function(txt){
			processSemanticTxt(txt);
			$.get("data/templateQC.txt",function(txt){
			    var lines = txt.split("\n");
			    for (var i = 0, len = lines.length; i < len; i++) {
			    	line = lines[i];
			    	var res = line.split(",");
			    	queryTemplates[res[1]] = {}
			    	queryTemplates[res[1]].count = res[0];
			    	queryTemplates[res[1]].text = res[2];
			    }				
				
				
				$("#loader").css( "display","none");
	
				$("#interface").css( "display","block");
				displayTemplates(data);
				populateColumn(data, 'columnA');
				populateColumn(data, 'columnB');		
				
				$('#templateList').on('click', 'li', function() {
				    $('#selectedTemplate').empty();
				    $('#selectedTemplate').append('You selected template <b>'+this.id+'</b> '+
				    		'<button id="clearTemplate" class="btn btn-danger btn-xs" type="button"> <span class="glyphicon glyphicon-remove"></span> </button>');
				    selectedTemplateID = this.id;
				    
				    $('#colAprompt').empty();
				    $('#colAprompt').append('Select a semantic type from the list of <b>semantic types used in query template:'+selectedTemplateID+'</b>');
				    
				    $('#colBprompt').empty();
				    $('#colBprompt').append('Select a semantic type from the list of <b>semantic types used in query template:'+selectedTemplateID+'</b>');
				    
				    $('#templateList li').removeClass( 'selectedListElement' );
				    $(this).toggleClass('selectedListElement');
				    
				    
				    $("#columnAsemanticExplorer").hide();
					$("#columnAlist").show();
				    $("#columnBsemanticExplorer").hide();
					$("#columnBlist").show();
					
				    populateColumn(data, 'columnA');
				    populateColumn(data, 'columnB');
				});
				
				$('#columnAlist').on('click', 'li', function() {
					selectedColumnAID = this.id;
					$('#selectedSemTypeA').empty();
				    $('#selectedSemTypeA').append('You selected semantic type <b>'+selectedColumnAID+': '+$(this).attr('qspCol')+'</b> '+
				    		'<button id="clearColA" class="btn btn-danger btn-xs" type="button"> <span class="glyphicon glyphicon-remove"></span> </button>');
				    
				    $('#selectedSemTypeB').empty();
				    $('#selectedSemTypeB').append('Displaying semantic types used in queries where template is <b>'+selectedTemplateID+'</b> and columnA is <b>'
				    		+$(this).attr('qspCol')+'</b>. ');
				    
//					$('#columnAlist li').removeClass( 'selectedListElement' );
//					$(this).toggleClass('selectedListElement');
					displaySemanticIcicle(selectedColumnAID, 'columnA');
					
					populateColumn(data, 'columnB');
				});	
				$('#columnBlist').on('click', 'li', function() {
					$('#selectedSemTypeB').empty();
				    $('#selectedSemTypeB').append('You selected semantic type <b>'+this.id+': '+$(this).attr('qspCol')+'</b> '+
		    		'<button id="clearColB" class="btn btn-danger btn-xs" type="button"> <span class="glyphicon glyphicon-remove"></span> </button>');
				    
//					$('#columnBlist li').removeClass( 'selectedListElement' );
//					$(this).toggleClass('selectedListElement');
					displaySemanticIcicle(this.id, 'columnB');
					
					if(selectedColumnAID!=""){
						
						displayParsets(selectedColumnAID, this.id);
					}

				});
				
				$(document).on("click", "#clearTemplate", function(){
					$('#selectedTemplate').empty();
				    $('#selectedTemplate').append('You have not selected a template yet.');
				    selectedTemplateID = "";
					$('#templateList li').removeClass( 'selectedListElement' );

					selectedColumnAID = "";
					populateColumn(data, 'columnA');
					populateColumn(data, 'columnB');
				});

				$(document).on("click", "#clearColA", function(){
					$('#selectedSemTypeA').empty();
				    $('#selectedSemTypeA').append('You have not selected a semantic type yet.');
					selectedColumnAID = "";
					$("#columnAlist").show();
					$("#columnAsemanticExplorer").hide();
					
					$('#selectedSemTypeB').empty();
					if(selectedTemplateID=="")
						$('#selectedSemTypeB').append('You have not selected a semantic type yet.');

					else	
						$('#selectedSemTypeB').append('Displaying semantic types used in queries where template is <b>'+selectedTemplateID+'</b> ');
//					$('#columnAlist li').removeClass( 'selectedListElement' );
					populateColumn(data, 'columnA');
					populateColumn(data, 'columnB');
				});
				$(document).on("click", "#clearColB", function(){
					$('#selectedSemTypeB').empty();
				    $('#selectedSemTypeB').append('You have not selected a semantic type yet.');
				    $("#columnBlist").show();
					$("#columnBsemanticExplorer").hide();
					selectedColumnAID = "";
//					$('#columnAlist li').removeClass( 'selectedListElement' );
				});
				
			});
		})	;
});//end loading data

function displayParsets(semanticAid, semanticBid){
	$("#parallelsets").empty();
//	var semanticAid = "wordnet_28105" //event
//	var semanticBid = "wordnet_5761049" //idea_thought
	var chart = d3.parsets().dimensions(["Semantic Type","Position", "Template"]);
	
	var vis = d3.select("#parallelsets").append("svg")
     .attr("width", chart.width())
     .attr("height", chart.height());

 
	addToParsetData(semanticAid, semanticBid);
	vis.datum(parsetdata).call(chart);

}
function addToParsetData(semanticid1, semanticid2 ){
	$.each(queryPermutations, function(key, value){
		if(value.columnA.id == semanticid1 && value.columnB.id == semanticid2){
			
			parsetelement = {}
			parsetelement["Semantic Type"] = _.select(wordnet, function (obj) {
			  return obj.uid === semanticid1;
			})[0].label;
			parsetelement.Position = "columnA";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
			
			parsetelement = {}
			parsetelement["Semantic Type"] = _.select(wordnet, function (obj) {
				  return obj.uid === semanticid2;
				})[0].label;
			parsetelement.Position = "columnB";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
		}
		else if(value.columnA.id == semanticid1 && value.columnB.id != semanticid2){
			parsetelement = {};
			parsetelement["Semantic Type"] = _.select(wordnet, function (obj) {
			  return obj.uid === semanticid1;
			})[0].label;
			parsetelement.Position = "columnA";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
			
			parsetelement = {};
			parsetelement["Semantic Type"] = "other";
			parsetelement.Position = "columnB";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
		}
	
		else if(value.columnA.id != semanticid1 && value.columnB.id == semanticid2){
			parsetelement = {}
			parsetelement["Semantic Type"] = "other";
			parsetelement.Position = "columnA";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
			
			parsetelement = {};
			parsetelement["Semantic Type"] = _.select(wordnet, function (obj) {
				  return obj.uid === semanticid2;
			})[0].label;
			parsetelement.Position = "columnB";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
		}
		if(value.columnA.id == semanticid2 && value.columnB.id == semanticid1){
			
			parsetelement = {}
			parsetelement["Semantic Type"] = _.select(wordnet, function (obj) {
			  return obj.uid === semanticid2;
			})[0].label;
			parsetelement.Position = "columnA";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
			
			parsetelement = {}
			parsetelement["Semantic Type"] = _.select(wordnet, function (obj) {
				  return obj.uid === semanticid1;
				})[0].label;
			parsetelement.Position = "columnB";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
		}
		else if(value.columnA.id == semanticid2 && value.columnB.id != semanticid1){
			
			parsetelement = {}
			parsetelement["Semantic Type"] = _.select(wordnet, function (obj) {
			  return obj.uid === semanticid2;
			})[0].label;
			parsetelement.Position = "columnA";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
			
			parsetelement = {}
			parsetelement["Semantic Type"] = "other";
			parsetelement.Position = "columnB";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
		}
		else if(value.columnA.id != semanticid2 && value.columnB.id == semanticid1){
			
			parsetelement = {}
			parsetelement["Semantic Type"] = "other";
			parsetelement.Position = "columnA";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
			
			parsetelement = {}
			parsetelement["Semantic Type"] = _.select(wordnet, function (obj) {
				  return obj.uid === semanticid1;
				})[0].label;			parsetelement.Position = "columnB";
			parsetelement.Template = value.template;
			parsetdata.push(parsetelement);
		}
		
	});
	
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
//Helper functions
function populateColumn(data, column){
	
	$('#'+column+'list').empty();
	
	var filtereddata = data;
	
	if(selectedTemplateID!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == selectedTemplateID;
		});
	}
	
	if(selectedColumnAID!=""){
		filtereddata = filtereddata.filter(function( obj ) {
	    return obj.columnA.id == selectedColumnAID;
		});
	}
	
	var uniqueEntities = _.uniq(filtereddata, function (item, key, a) {
		return item[column].label;}
	);
	var listelements = []

	$.each(uniqueEntities, function( index, value) {
		if(value[column].id!=undefined){
			var element = {};
		element.semobject = value;
		element.querycount = fetchQC(value[column].id,column,value.template);
		listelements.push(element);	
		}
	});
	listelements = _.sortBy(listelements, function(element){ return - element.querycount;})

	
	$.each(listelements, function( index, element) {
		thislabel= element.semobject[column].label;
		if(!isNaN(element.querycount)){
			querycount = fetchQC(element.semobject[column].id,column,selectedTemplateID);
  			$('#'+column+'list').append('<li id='+element.semobject[column].id+' qspCol="'+thislabel+'" class="list-group-item">'+
		      '<span id="'+column+'" >'+thislabel+'</span><span class="badge">'+element.querycount+'</span></li>');
		}
  	});	
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
	var listelements = []
	$.each(uniqueEntities, function( index, value) {
		var element = {};
		var template = value.template;
		if(queryTemplates[template]!=undefined && (queryTemplates[template].text).indexOf('Ignore')==-1){
			element.template = template;
			element.templatecount = queryTemplates[template].count;
			element.text = queryTemplates[template].text;
			listelements.push(element);		
		}
	});
	listelements = _.sortBy(listelements, function(element){ return - element.templatecount;})
	$.each(listelements, function( index, value) {
	list.append('<li class="list-group-item" id="'+value.template+'" permutations = "'+value.templatecount+
			'"><span class ="badge">'+value.templatecount+'</span>'+value.text+'</li>');
	});
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
			
			filteredQueryStats  = (_.uniq(o.queryStats, function (item) {
				return Object.keys(item)[0]==id;
				}));
			if(filteredQueryStats[1]==undefined){
//				console.log(uid+" "+column+" "+template);
				return 0;
			}
			else{			
				return filteredQueryStats[1][id];// NO IDEA WHY TWO ARE RETURNED!!!! :/
}	
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

function displaySemanticIcicle(uid, column){
//	$("#"+column+"semanticExplorerPanel").show();
	$("#"+column+"list").hide();
	$("#"+column+"semanticExplorer").empty();
	$("#"+column+"semanticExplorer").show();
	
	var w = 700,h = 600;
	var x = d3.scale.linear().range([0, w]);
	var y = d3.scale.linear().range([0, h]);

	//create data for zoomable partition
	icicle = {}
	var semanticobject = _.select(wordnet, function (obj) {
		  return obj.uid === uid;
		});
	recursiondepth = 0;
	var key = semanticobject[0].label;
	$("#"+column+"semanticExplorer").append('<p>Displaying zoomable partition for semantic type = "'+key
			+'", with id="'+uid+'"</p>');
	icicle[key] = {};
	processObject(semanticobject[0], recursiondepth, icicle[key]);
	var root = d3.entries(icicle)[0];
	
	//debug only
//	$("#iciclePrintout").empty();
//	$("#iciclePrintout").append(JSON.stringify(icicle));

	
	var partition = d3.layout.partition()
					.children(function(d) { 
						return isNaN(d.value) ? d3.entries(d.value) : null; 
						})
					.value(function(d) { 
						return d.value; });
	
	
	var svg = d3.select("#"+column+"semanticExplorer").append("svg")
	.attr("width", w)
	.attr("height", h);
	
	var g = svg.selectAll("#"+column+"semanticExplorer g")
    .data(partition.nodes(root))
    .enter().append("svg:g")
    .attr("transform", function(d) { 
    	return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
    .on("click", clicked);
	
	var kx = w / root.dx,
    ky = h / 1;
	 
	 g.append("svg:rect")
     .attr("width", root.dy * kx)
     .attr("height", function(d) { return d.dx * ky; })
     .attr("class", function(d) { return d.children ? "parent" : "child"; });

     g.append("svg:text")
     .attr("transform", transform)
     .attr("dy", ".35em")
     .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
     .text(function(d) { return d.key; })

     g.style("display", function(d) {
    	    if (d.depth > 1) {
    	        return "none";//nodes whose depth is more than 1 make its vanish
    	      } else {
    	        return "block";
    	      }
    	    });
     
 d3.select(window)
     .on("click", function() { clicked(root); })
	
     
    function transform(d) {
        return "translate(8," + d.dx * ky / 2 + ")";
    }
 
 function clicked(d) {
        if (!d.children) return;

        kx = (d.y ? w - 40 : w) / (1 - d.y);
        ky = h / d.dx;
        x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
        y.domain([d.x, d.x + d.dx]);
        
        d3.selectAll("#"+column+"semanticExplorer g").each( function(d1, i){
        	
        		  if($(this).css("display")=="none" && d1.depth==d.depth-1){// the element is hidden and before the element i clicked on
        			  $(this).css("display","block");//show element
        			  
        		  }
        		  else if (d1.depth ==d.depth+1 || d1.key==d.key) {//the element is the element i clicked on or a depth ahead.
        			  
        			  $(this).css("display","block");//show element
                  }
                  else {                    	
                    	$(this).css("display", "none");
                    }
        		});
         
   
        var g = svg.selectAll("#"+column+"semanticExplorer g");
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
      }	
}


function processObject(parent, recursiondepth, parentIcicle){
	recursiondepth++;
//	console.log("Processing: <"+ parent.label+", "+parent.uid+">");
//	console.log("Has children: ["+parent.derivedFrom+"]");
	$.each(parent.derivedFrom, function(index, value){
//		console.log("parentIcicle: "+JSON.stringify(parentIcicle));

		var depth ="-";
		var o = _.select(wordnet, function (obj) {
			  return obj.uid === value;
			});
		
		if(o.length==0){//reached a leaf (tag)
			o = _.select(tags, function (obj) {
			  return obj.uid === value;
			});
			childSemantics = o[0];
//			console.log("Processing child of "+parent.label+": <"+ childSemantics.label+", "+childSemantics.uid+">");
			recursiondepth--;
			parentIcicle[childSemantics.label] = fetchQC(childSemantics.uid,selectedColumnAID,selectedTemplateID)//childSemantics.columnCount;
			}
		else{
			childSemantics = o[0];
//			console.log("Processing child of "+parent.label+": <"+ childSemantics.label+", "+childSemantics.uid+">");
			if(parentIcicle[childSemantics.label]===undefined)
				parentIcicle[childSemantics.label]= {};
			
			processObject(childSemantics, recursiondepth, parentIcicle[childSemantics.label]);
		}
	});
}