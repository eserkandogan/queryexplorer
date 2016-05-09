package actions;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetAddress;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.index.query.QueryBuilders.*;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.google.common.primitives.Ints;

import control.Action;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class CalculateQueryCounts implements Action {
	 private static final String INDEX_NAME = "viqs";
	 private static final String TYPE_NAME  = "querysemantics";
	 long totalquerytime = 0;
	@Override
	public boolean execute(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		String selectedTemplateID =  req.getParameter("selectedTemplateID");
		String referencedColumn = req.getParameter("referencedColumn");
		String referencedColumnID = req.getParameter("referencedColumnID");
		System.out.println("CalculateQueryCounts");
		System.out.println(selectedTemplateID +", "+ referencedColumn +", "+ referencedColumnID);
		
		JSONArray elements = new JSONArray();
		
		 
		JSONParser parser = new JSONParser();
		int counter = 1;
		elements.add((JSONObject)getQueryCount( selectedTemplateID, referencedColumn, referencedColumnID ));
		
		
        res.setContentType("application/json");
        PrintWriter aPrint = res.getWriter();
        String jsonreply = "";

        aPrint.print(jsonreply);
        return true;
	}
	private JSONObject getQueryCount(String templateid, String referencedColumn, String referencedColumnID){
        JSONObject listelement = null;
        JSONObject queryString = null;
		JSONParser parser = new JSONParser();
		JSONObject queryterm;
		MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        OkHttpClient client = new OkHttpClient();
            String url = "http://localhost:9200/"+INDEX_NAME+"/"+TYPE_NAME+"/_search";
            String query = "{\"query\":"
            				+ "{\"filtered\":"
            				+ "		{\"filter\":"
            				+ "			{\"bool\":"
            				+ "				{\"must\":["
            				+ "					]"
            				+ "				}"
            				+ "			}"
            				+ "		}"
            				+ "	}"
            				+ "}";
            try {
				 queryString = (JSONObject) parser.parse(query);
				JSONArray must = (JSONArray) ((JSONObject)((JSONObject)((JSONObject)((JSONObject)queryString.get("query")).get("filtered")).get("filter")).get("bool")).get("must");

				if(!templateid.equals("")){
					queryterm = (JSONObject) parser.parse("{\"term\":{\"template\":\""+templateid+"\"}}");
					must.add(queryterm);
				}
				
				if(!referencedColumnID.equals("") && referencedColumn.equals("columnA")){
					queryterm = (JSONObject) parser.parse("{\"term\":{\"columnA.id\":\""+referencedColumnID+"\"}}");
					must.add(queryterm);
				}
				else if(!referencedColumnID.equals("") && referencedColumn.equals("columnB")){
					queryterm = (JSONObject) parser.parse("{\"term\":{\"columnB.id\":\""+referencedColumnID+"\"}}");
					must.add(queryterm);
				}
				
//				System.out.println(queryString.toString());
			} catch (ParseException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
        okhttp3.RequestBody body = okhttp3.RequestBody.create(JSON, queryString.toString());
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
//        System.out.println(request);
        Response response;
		try {
			long startExecuteQueryTime = System.nanoTime();
			response = client.newCall(request).execute();
			long executeQueryTime = (System.nanoTime() - startExecuteQueryTime) / 1000000;
			System.out.println("executeQueryTime = "+executeQueryTime+ "ms");
			totalquerytime = totalquerytime+executeQueryTime;
			String responseString = response.body().string();
//			System.out.println(responseString);
			JSONObject responseJson = (JSONObject) parser.parse(responseString);
			
			JSONArray hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
			
			long querycount = 0;
			long startProcessResultsTime = System.nanoTime();

			for(Object o : hits){
				querycount = (long)(((JSONObject)((JSONObject)o).get("_source")).get("count"));
				listelement = new JSONObject();
				JSONObject semobject = new JSONObject();
				listelement.put("semobject", semobject);
				listelement.put("querycount", querycount);
			}
			long processResultsTime = (System.nanoTime() - startProcessResultsTime) / 1000000;
			System.out.println("processResultsTime = "+processResultsTime+ "ms");


		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return listelement;
	}
	@Override
	public String getView() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Object getModel() {
		// TODO Auto-generated method stub
		return null;
	}

}
