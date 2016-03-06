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
		$("#loader").css( "display","none");

		$("#interface").css( "display","block");
		displayTemplates(data);
		populateColumnA(data, "");
		
		$('#templateList').on('click', 'li', function() {
		    $('#templates').hide();
		    $('#explorequeries').append('Query Template "' 
		    		+this.id+'" accounts for '+ $(this).attr('permutations')+' query permutations'  );		    
		    populateColumnA(data, this.id);
		    
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
	var filtereddata = data;
	if(template!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == template;
		});
	}
	
	data.sort(function(a, b){
    	var a1= a.columnA.columnCount, b1= b.columnA.columnCount;
    	if(a1 == b1) return 0;
    	return b1 > a1? 1: -1;
	});	

	var uniqueSemantics = _.uniq(data, function (item, key, a) {return item.columnA.label;});


	$.each(uniqueSemantics, function( index, value) {
		thislabel= value.columnA.label;
		if(!isNaN(value.columnA.columnCount)){
  			$('#columnAlist').append('<li id="columnA_'+index+'" qspColA="'+thislabel+'" class="list-group-item">'+
  		      '<span id="columnA" >'+thislabel+'</span><span class="badge">'+value.columnA.columnCount+'</span></li>');
	}
  	});	
}
