<%@ page language="java" contentType="text/html; charset=US-ASCII"
    pageEncoding="US-ASCII"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=US-ASCII">
<link rel="stylesheet" href="//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css">
<link rel="stylesheet" href="bootstrap/dist/css/bootstrap.min.css">
<style>
	.response {
	max-height:400px;
	overflow:scroll;
	margin:20px;
	}
	.api{
		padding-left:10px;
	}

</style>
<title>Elasticsearch VIQS API</title>


</head>
<body>
	<div class="api">
		<form id="rank-templates" action="#">
		<h3>Rank Templates</h3>
			<label for="rank-template-concept1">Concept Value in Column 1</label>
			<input id="rank-template-concept1" name="rank-template-concept1" type="text" />
			<br>
			<label for="rank-template-concept2">Concept Value in Column 2</label>
			<input id="rank-template-concept2" name="rank-template-concept2" type="text"/>
			<br>
			<input type="submit"/>
		</form>
		<pre id="rank-templates-response" class="response"></pre>
	</div>
	<hr>
	<div class="api">
		<form id="rank-concepts">
		<h3>Rank Concepts</h3>
			<label for="rank-concepts-template">Template Value</label>
			<input id="rank-concepts-template" name="rank-concepts-template" type="text" value="compare_3"/>
			<br>
			<label for="rank-concepts-referencecolumn">Reference position</label>
			<select id="rank-concepts-referencecolumn" name="rank-concepts-referencecolumn">
				<option value="column 1" selected>Column 1</option>
				<option value="column 2">Column 2</option>
			</select>
			<br>
			<label for="rank-concepts-fixedvalue">Selected concept in <span id="fixedColumn">Column 2</span></label>
			<input id="rank-concepts-fixedvalue" name="rank-concepts-fixedvalue" type="text" value="wordnet_14914858"/><!-- wordnet_32028 -->
			<br>
			<input type="submit"/>
		</form>
		<pre id="rank-concepts-response" class="response"></pre>
	</div>
	<hr>
	<div class="api">
		<form id="rank-templateconcept">
		<h3>Rank Itemsets (template, concept)</h3>
		<select id="rank-templateconcept-referencecolumn" name="rank-templateconcept-referencecolumn">
				<option value="column 1" selected>Column 1</option>
				<option value="column 2">Column 2</option>
			</select>
			<input type="submit"/>
		</form>
		<pre id="rank-templateconcept-response" class="response"></pre>
	</div>
	<hr>
	<div class="api">
		<form id="rank-conceptcombo">
		<h3>Rank Itemsets (concept, concept)</h3>
		Show top 100 combinations of 
			<input type="submit"/>
		</form>
		<pre id="rank-conceptcombo-response" class="response"></pre>
	</div>
	<hr>
	<div class="api">
		<form id="">
		<h3>Rank Itemsets (template, concept, concept)</h3>
			<input type="submit"/>
		</form>
		<pre id="rank-concepts-response" class="response"></pre>
	</div>
	<hr>
	
	
	
	<script src="https://d3js.org/d3.v3.min.js"></script>
    <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
	<script src="//code.jquery.com/ui/1.11.0/jquery-ui.js"></script>
    <script src="underscore/underscore-min.js"></script>
	
	<script>
	$("#rank-concepts-referencecolumn").change(function(){
		if($("#rank-concepts-referencecolumn").val()=="Column 1")
			$("#fixedColumn").text("Column 2");
		else 
			$("#fixedColumn").text("Column 1");
	});
	
	$("#rank-templates").submit(function( event ) {
		$("#rank-templates-response").empty();
		$('#rank-templates-response').html('<img alt="" src="images/progress_bar.gif">');
		
		var columnParams = '&selectedColumnAID='+$( "#rank-template-concept1" ).val()+
							'&selectedColumnBID='+$( "#rank-template-concept2" ).val();
		var url = 'controller?action=GET_TEMPLATE_LIST&'+columnParams;
		$.ajax({
		     url: url,
		     type: 'post', 
		     dataType: 'json',
	         contentType: "application/json; charset=utf-8",
	         mimeType: 'application/json',
		     success: function(listelements) {
		    		listelements = _.sortBy(listelements, function(element){ return - element.querycount;})

				$("#rank-templates-response").empty();
		    	document.getElementById("rank-templates-response").innerHTML = JSON.stringify(listelements, undefined, 2);
		     },
		     error:function(result) {
		       alert('ERROR');
		     }
		});
		
		event.preventDefault();
	});
	
	$( "#rank-concepts" ).submit(function( event ) {
		$("#rank-concepts-response").empty();

		$('#rank-concepts-response').html('<img alt="" src="images/progress_bar.gif">');
		var columnParams;
		if($( "#rank-concepts-referencecolumn :selected").text()=="Column 1"){
			columnParams = '&selectedColumnAID='+''+
			'&selectedColumnBID='+$( "#rank-concepts-fixedvalue" ).val()+'&column=columnA';
			console.log(columnParams);
		}
		else{ 
			columnParams = '&selectedColumnAID='+$( "#rank-concepts-fixedvalue" ).val()+
			'&selectedColumnBID='+'&column=columnB';
			console.log(columnParams);
		}
		var template=$( "#rank-concepts-template").val();
		console.log(template);
		var url = 'controller?action=GET_SENSE_LIST&selectedTemplateID='+template+columnParams;
		$.ajax({
		     url: url,
		     type: 'post', 
		     dataType: 'json',
	         contentType: "application/json; charset=utf-8",
	         mimeType: 'application/json',
		     success: function(listelements) {
		    		listelements = _.sortBy(listelements, function(element){ return - element.querycount;})

				$("#rank-concepts-response").empty();
		    	document.getElementById("rank-concepts-response").innerHTML = JSON.stringify(listelements, undefined, 2);
		     },
		     error:function(result) {
		       alert('ERROR');
		     }
		});
	  
	  event.preventDefault();
	  
	});
	$("#rank-templateconcept").submit(function( event ) {
		$("#rank-templateconcept-response").empty();
		$('#rank-templateconcept-response').html('<img alt="" src="images/progress_bar.gif">');
		if($( "#rank-templateconcept-referencecolumn :selected").text()=="Column 1"){
			column="columnA";
		}else {			column= "columnB";
}

		var url = 'controller?action=GET_TEMPLATECONCEPT_LIST&column='+column;
		$.ajax({
		     url: url,
		     type: 'post', 
		     dataType: 'json',
	         contentType: "application/json; charset=utf-8",
	         mimeType: 'application/json',
		     success: function(listelements) {
		    			listelements = _.sortBy(listelements, function(element){ return - element.querycount;})
						$("#rank-templateconcept-response").empty();
		    			document.getElementById("rank-templateconcept-response").innerHTML = JSON.stringify(listelements, undefined, 2);
		     },
		     error:function(result) {
		       alert('ERROR');
		     }
		});
		
		event.preventDefault();
	});
	$("#rank-conceptcombo").submit(function( event ) {
		$("#rank-conceptcombo-response").empty();
		$('#rank-conceptcombo-response').html('<img alt="" src="images/progress_bar.gif">');
		var url = 'controller?action=GET_CONCEPTCOMBO_LIST';
		$.ajax({
		     url: url,
		     type: 'post', 
		     dataType: 'json',
	         contentType: "application/json; charset=utf-8",
	         mimeType: 'application/json',
		     success: function(listelements) {
		    			listelements = _.sortBy(listelements, function(element){ return - element.querycount;})
						$("#rank-conceptcombo-response").empty();
		    			document.getElementById("rank-conceptcombo-response").innerHTML = JSON.stringify(listelements, undefined, 2);
		     },
		     error:function(result) {
		       alert('ERROR');
		     }
		});
		
		event.preventDefault();
	});
	</script>
</body>
</html>