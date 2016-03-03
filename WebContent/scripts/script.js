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
		displayTemplates(data);
		$('#templates').on('click', 'li', function() {
		    $('#templates').hide();
		    $('#explorequeries').append('Query Template "' 
		    		+this.id+'" accounts for '+ $(this).attr('permutations')+' query permutations'  );		    
		    populateColumnA(data, this.id);
		    
		});
		$.get("data/wordsemantics-2.20-json.txt",function(txt){
	        var lines = txt.split("\n");
	        for (var i = 0, len = lines.length; i < 2; i++) {
	        	jsonSemantics = $.parseJSON(lines[i]);
	            console.log(jsonSemantics.label);
	        }
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
	var uniqueEntities = _.uniq(data, function (item, key, a) {return item.template;});
	
	var list = $("#templates").append('<ul class="list-group"></ul>').find('ul');
	var icicletemplates = {}
	$.each(uniqueEntities, function( index, value) {
		var filteredByTemplate = data.filter(function( obj ) {
		    return obj.template == value.template;
			});
		list.append('<li class="list-group-item" id="'+value.template+'" permutations = "'+filteredByTemplate.length+
				'"><span class ="badge">'+filteredByTemplate.length+'</span>'+value.template+'</li>');		
	});
}


function populateColumnA(data,  template){	
	var filteredByTemplate = data.filter(function( obj ) {
	    return obj.template == template;
		});
	
		stroll.bind( '#columnA ul' );

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
  			$('#columnAlist').append('<li id="columnA_'+index+'" qspColA="'+thislabel+'" class="list-group-item">'+
  		      '<div class="alert " role="alert"> <span class="badge">'+value.columnA.columnCount+'</span>'+
  		      '<span id="columnA" >'+thislabel+'</span></div></li>');
  		}
  		lastlabel = thislabel;
	});	
}
