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
		populateTemplateCloud(data);
		$('#columnA').on('click', 'li', function() {
			$( "#columnA div" ).removeClass( "alert-success" );
		    $('#'+$(this).attr('id')+' div').toggleClass( 'alert-success' );
			var colAlabel = $(this).attr('qspColA');
			var templateFilter = JSON.parse($("#template").text());
			var colBdata = data.filter(function( obj ) {
			    return obj.template == templateFilter && obj.columnA.label== colAlabel;
			});
			populateColumnB(colBdata);
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

function populateTemplateCloud(data){	
	var templates = []
	var i=0;
	var uniqueEntities = _.uniq(data, function (item, key, a) {return item.template;});
	$.each(uniqueEntities, function( index, value) {
		object = {};
		object.text = value.template;
		var filteredByTemplate = data.filter(function( obj ) {
		    return obj.template == value.template;
			});
		object.weight = filteredByTemplate.length;
		object.handlers={click: function() { 
			  $("#template").text('"'+value.template+'"');
			  $("#template-badge").text(filteredByTemplate.length);
				  populateColumnA(filteredByTemplate);
			}}
		
		templates[i] = object;
		i++
	});
	
	$("#templatepicker").jQCloud(templates, {
  autoResize: true
})
		
}

	
function populateColumnA(data){	
	stroll.bind( '#datadiv ul' );

	data.sort(function(a, b){
    	var a1= a.columnA.columnCount, b1= b.columnA.columnCount;
    	if(a1 == b1) return 0;
    	return b1 > a1? 1: -1;
	});	

	console.log(data.length)
	var uniqueEntities = _.uniq(data, function (item, key, a) {return item.columnA.label;});
	console.log(uniqueEntities.length)

	lastlabel ='';
	thislabel ='';

	$.each(uniqueEntities, function( index, value) {
		thislabel= value.columnA.label;
		if(thislabel!= lastlabel){
  			$('#columnA').append('<li id="columnA_'+index+'" qspColA="'+thislabel+'" class="list-group-item">'+
  		      '<div class="alert " role="alert"> <span class="badge">'+value.columnA.columnCount+'</span>'+
  		      '<span id="columnA" >'+thislabel+'</span></div></li>');
  		}
  		lastlabel = thislabel;
	});	
}	

function populateColumnB(data){	
	stroll.bind( '#datadiv ul' );

	$('#columnB').empty();
	$.each(data, function( index, value) {
		var listclass='';
  		$('#columnB').append('<li id="columnB_'+index+'" qsp="'+value+'" class="list-group-item '+listclass+'">'+
  		      '<div class="alert " role="alert"><span id="columnB" >'+value.columnB+'</span></div></li>');
	});	
}

