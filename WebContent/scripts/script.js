var id=0;

d3.csv("data/qsp1.csv", function(d) {
	id= id+1;	
	var toReturn =  {
		qspid : id,
	    count : +d.count,
	    template : d.template,
	    columnA : parseColumnSemantics( d.columnA, 1),//columnAobject,
	    columnB : d.columnB//parseColumnSemantics( d.columnB, 2)
	  };	
	  return toReturn;
	}, function(data) {
		$.get("data/wordsemantics-2.20-json.txt",function(txt){
			processSemanticTxt(txt);
			$("#loader").css( "display","none");

			$("#interface").css( "display","block");
			displayTemplates(data);
			populateColumnA(data, "");
			
			$('#templateList').on('click', 'li', function() {
			    $('#selectedTemplate').empty();
			    $('#selectedTemplate').append(this.id);		    
			    populateColumnA(data, this.id);
			});
			
			$('#columnAlist').on('click', 'li', function() {
				alert(this.id);
				displaySemanticIcicle(this.id);
				
	//			$( "#columnA div" ).removeClass( "alert-success" );
	//		    $('#'+$(this).attr('id')+' div').toggleClass( 'alert-success' );
	//			var colAlabel = $(this).attr('qspColA');
	//			var templateFilter = JSON.parse($("#template").text());
	//			var colBdata = data.filter(function( obj ) {
	//			    return obj.template == templateFilter && obj.columnA.label== colAlabel;
	//			});
	//			populateColumnB(colBdata);
			});
		
			
		});
			
});//end loading data

//Helper functions

function parseColumnSemantics(data, num){
	var columnObject = [];
	var objectElements = data.split(/[[\]]{1,2}/);	
	columnObject["label"] = objectElements[0];
	columnObject["id"]= objectElements[1];
	columnObject["abstractionLevel"]= objectElements[2];
	columnObject["columnCount"]= +objectElements[3];

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
		var filteredByTemplate = data.filter(function( obj ) {
		    return obj.template == template;
		});
		var templatecount = 0;
		$.each(data, function(index, value){
			if(value.template == template)
				templatecount= templatecount + value.count;
		});
		element.template = template;
		element.templatecount = templatecount;
		listelements.push(element);		
	});
	listelements = _.sortBy(listelements, function(element){ return - element.templatecount;})
	$.each(listelements, function( index, value) {
	list.append('<li class="list-group-item" id="'+value.template+'" permutations = "'+value.templatecount+
			'"><span class ="badge">'+value.templatecount+'</span>'+value.template+'</li>');
	});
}


function populateColumnA(data,  template){
	$('#columnAlist').empty();
	var filtereddata = data;
	if(template!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == template;
		});
	}
	
	filtereddata.sort(function(a, b){
    	var a1= a.columnA.columnCount, b1= b.columnA.columnCount;
    	if(a1 == b1) return 0;
    	return b1 > a1? 1: -1;
	});	

	var uniqueSemantics = _.uniq(filtereddata, function (item, key, a) {return item.columnA.label;});		
	
	
	$.each(uniqueSemantics, function( index, value) {
		thislabel= value.columnA.label;
		if(!isNaN(value.columnA.columnCount)){
  			$('#columnAlist').append('<li id='+value.columnA.id+' qspColA="'+thislabel+'" class="list-group-item">'+
  		      '<span id="columnA" >'+thislabel+'</span><span class="badge">'+value.columnA.columnCount+'</span></li>');
		}
  	});	
}




var wordnet = [];
var tags = [];
	
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
// createLabelList(wordnet);
// createLabelList(tags);
	
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
var icicle;
function displaySemanticIcicle(uid){
	icicle = {}
	var semanticobject = _.select(wordnet, function (obj) {
		  return obj.uid === uid;
		});
	recursiondepth = 0;
	var key = semanticobject[0].label;
	icicle[key] = {};
	icicle[key] = processObject(semanticobject[0], recursiondepth, icicle);
}

//create data structure like https://gist.github.com/tchaymore/1255176
// for zoomable partition

function processObject(parent, recursiondepth, parentIcicle){
	recursiondepth++;
    elementAtDepth= {};
    parentIcicle[parent.label] = {}	;
//	console.log(parent[0].uid + " " +parent[0].label)
//	console.log(parent[0].derivedFrom);
	
	$.each(parent.derivedFrom, function(index, value){
		var depth ="-";
		var o = _.select(wordnet, function (obj) {
			  return obj.uid === value;
			});
		
		if(o.length==0){//reached a leaf (tag)
			o = _.select(tags, function (obj) {
			  return obj.uid === value;
			});
			recursiondepth--;
			for(var i= 0; i<recursiondepth; i++){
				depth = depth+"-";
			}
			childSemantics = o[0];
			console.log("TAG "+depth+" "+childSemantics.label);
			parentIcicle[parent.label][childSemantics.label] = childSemantics.columnCount;
			console.log(parentIcicle);
			return parentIcicle;

			}
		else{
			for(var i= 0; i<recursiondepth; i++){
				depth = depth+"-";
			}
			childSemantics = o[0]
			console.log(parentIcicle);
			console.log(depth+" "+ childSemantics.label);
			parentIcicle[parent.label][childSemantics.label] = processObject(childSemantics, recursiondepth, parentIcicle);
			console.log(parentIcicle);
			return parentIcicle;
		}
	});
}