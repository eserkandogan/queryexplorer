<%@ page language="java" contentType="text/html; charset=US-ASCII"
    pageEncoding="US-ASCII"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%-- 
    Document   : index
    Author     : christina christodoulakis
--%>
<html class="no-js" lang="">
  <head>
    <meta charset="utf-8">
    <title>QueryExplorer</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

    <link rel="stylesheet" href="//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css">
    <link rel="stylesheet" href="bootstrap/dist/css/bootstrap.min.css">
    
    <link rel="stylesheet" href="style.css">    
    <link rel="stylesheet" href="d3.parsets.css">    
  </head>

<body>

<div class="panel panel-default">
<div class="panel-heading"><h1 class="panel-title">Query Explorer</h1></div>
<div class="panel-body">
	<div id="loader">JSP Loading data, please wait.<br>
	<img alt="" src="images/progress_bar.gif">
	</div>	
	<table class="table" id="interface">
		<thead>
			<tr>
				<th style="width:520px;">Query template</th>
				<th style="width:560px;">Column X semantic types</th>
				<th></th>
				<th style="width:500px;">Column Y semantic types</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			<tr id = "querySemanticsRow">
				<td >
					<div class="" id="templateDisplay">
						<div class = "scrollable" style="height:600px">
							<ul id="templateList" class="list-group"></ul>
						</div>
					</div>
				</td>
				<td>
					<div class="" id="columnADisplay">
						<div id="colAprompt"></div>
						<div id="columnAcontainer"></div>
						<div id="columnAsemanticExplorer"></div>
					</div>
				</td>
				<td align="center"><div id = "selectedTemplate2" class="templatetext"></div></td>
				<td>
					<div class="" id="columnBDisplay">
						<div id="colBprompt"></div>
						<div  id="columnBcontainer"></div>
						<div id="columnBsemanticExplorer"></div>
					</div>
				</td>
				<td align="center">
					<div id = "selectedTemplate3"  class="templatetext"></div>
				</td>
			</tr>
		</tbody>
	</table>
	<hr>
	<div>
		<div id="" class="panel panel-default parsetholder">
			<div class="panel-heading" >Column X Parallel Sets</div>
			<div class="panel-body" id="columnAparset"></div>	
		</div>
		<div id="" class="panel panel-default parsetholder">
			<div class="panel-heading" >Column Y Parallel Sets</div>
			<div class="panel-body" id="columnBparset"></div>	
		</div>
	</div>	
	<!-- <div class="panel panel-default" id="examplequeriespanel">		
		<div class="panel-heading"><h3 class="panel-title">Example Queries</h3></div>
		<div class="panel-body" id="examplequeries"></div>	
	</div>
	<div class="panel panel-default" id="semanticsbrowserpanel">		
		<div class="panel-heading"><h3 class="panel-title">Semantics browser</h3></div>
		<div class="panel-body" >
			<div id="semanticsbrowser"></div>
			<div id="semanticsbrowserdetails"></div>
		</div>	
	</div>
	<div class="panel panel-default" id="tagsbrowserpanel">		
		<div class="panel-heading"><h3 class="panel-title">Tags browser</h3></div>
		<div class="panel-body" ><div id="tagsbrowser"></div><div id="tagsbrowserdetails"></div></div>	
	</div>
	 -->
</div>
</div>


	<script src="https://d3js.org/d3.v3.min.js"></script>
    <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
    <script src="elasticsearch-js/elasticsearch.jquery.js"></script>
    
	<script src="//code.jquery.com/ui/1.11.0/jquery-ui.js"></script>
	<script src="scripts/jquery.tablesorter.min.js"></script>
    <script src="underscore/underscore-min.js"></script>
    <script src="d3.parsets.js"></script>
    <script src="scripts/script.js"></script>
    
<div id="partitiontooltip" style="display:none" class="partitiontooltip"></div>
  </body>
</html>