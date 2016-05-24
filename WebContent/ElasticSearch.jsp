<%@ page language="java" contentType="text/html; charset=US-ASCII"
    pageEncoding="US-ASCII"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=US-ASCII">
<link rel="stylesheet" href="//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css">
<link rel="stylesheet" href="bootstrap/dist/css/bootstrap.min.css">
<title>Elasticsearch VIQS API</title>


</head>
<body>
	<div>
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
		<pre id="rank-templates-response"></pre>
	</div>
	<hr>
	<div>
		<form id="rank-column1">
		<h3>Rank Concepts in Column 1</h3>
		
			<label for="rank-column1-template">Template Value</label>
			<input id="rank-column1-template" name="rank-column1-template" type="text" value="compare_3"/>
			<br>
			<label for="rank-column1-concept2">Concept Value in Column 2</label>
			<input id="rank-column1-concept2" name="rank-column1-concept2" type="text" value="wordnet_14914858"/>
			<br>
			<input type="submit"/>
		</form>
		<pre id="rank-column1-response"></pre>
	</div>
	<hr>
	<div>
		<form id="rank-column2">
		<h3>Rank Concepts in Column 2</h3>
		
			<label for="rank-column2-template">Template Value</label>
			<input id="rank-column2-template" name="rank-column2-template"type="text" value="compare_3"/>
			<br>
			<label for="rank-column2-concept1">Concept Value in Column 1</label>
			<input id="rank-column2-concept1" name="rank-column2-concept1" type="text"/>
			<br>
			<input type="submit"/>
		</form>
		<pre id="rank-column2-response"></pre>
	</div>
	
	
	<script src="https://d3js.org/d3.v3.min.js"></script>
    <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
	<script src="//code.jquery.com/ui/1.11.0/jquery-ui.js"></script>
	<script>
	$( "#rank-templates" ).submit(function( event ) {
		  alert( "Handler for .submit() called." );
		  event.preventDefault();
		});
	$( "#rank-column1" ).submit(function( event ) {
	  alert( "Handler for .submit() called." );
		$.ajax({
		     url: 'controller?action=GET_SENSE_LIST&selectedTemplateID='+$( "#rank-column1-template" ).val()+
		     											'&selectedColumnAID='+''+
		     											'&selectedColumnBID='+$( "#rank-column1-concept2" ).val()+
		     											'&column=columnA',
		     type: 'post', 
		     dataType: 'json',
	         contentType: "application/json; charset=utf-8",
	         mimeType: 'application/json',
		     success: function(listelements) {
		       console.log('populateColumnServerside successful');
// 		       $( "#rank-column1-response" ).append(listelements);
		       document.getElementById("rank-column1-response").innerHTML = JSON.stringify(listelements, undefined, 2);
		     },
		     error:function(result) {
		       alert('ERROR');
		     }
		});
	  
	  event.preventDefault();
	  
	});
	$( "#rank-column2" ).submit(function( event ) {
	  alert( "Handler for .submit() called." );
	  event.preventDefault();
	});

	</script>
</body>
</html>