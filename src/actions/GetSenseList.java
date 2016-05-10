package actions;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.util.Set;

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

public class GetSenseList implements Action {
	 private static final String INDEX_NAME = "viqs";
	 long totalquerytime = 0;
	 
	@Override
	public boolean execute(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

		System.out.println("GetSenseList");
		
		String selectedTemplateID =  req.getParameter("selectedTemplateID");
		String selectedColumnAID = req.getParameter("selectedColumnAID");
		String selectedColumnBID = req.getParameter("selectedColumnBID");
		String column = req.getParameter("column");
		System.out.println("selectedTemplateID = " +selectedTemplateID +
					", selectedColumnAID = "+ selectedColumnAID +
					", selectedColumnBID ="+ selectedColumnBID+
					", column = "+column);
		System.out.println(column);
		
		JSONArray elements = getQueryCount( selectedTemplateID, selectedColumnAID, selectedColumnBID, column );
		
        res.setContentType("application/json");
        PrintWriter aPrint = res.getWriter();

        aPrint.print(elements.toString());
        return true;
	}
	private JSONObject runQuery(String typename, String scroll_id){
		JSONParser parser = new JSONParser();
		JSONObject queryString = null;
		JSONObject queryterm;
		JSONObject responseJson = null;
		MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        OkHttpClient client = new OkHttpClient();
        String query;
        String url = "http://localhost:9200/";
        
        if(scroll_id.equals("")){ 
        	url = url+INDEX_NAME+"/"+typename+"/_search?scroll=1m&size=1000";
        	query = "{\"query\":{\"match_all\" : {}}}";
        	}
        else{
        	url = url+"_search/scroll";
        	query = "{\"scroll\":\"1m\",\"scroll_id\":\""+scroll_id+"\"}";
        	}
        
		okhttp3.RequestBody body = okhttp3.RequestBody.create(JSON, query.toString());
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        Response response;
		
		long startExecuteQueryTime = System.nanoTime();
		try {
			response = client.newCall(request).execute();
		
			long executeQueryTime = (System.nanoTime() - startExecuteQueryTime) / 1000000;
			System.out.println("executeQueryTime = "+executeQueryTime+ "ms");
			totalquerytime = totalquerytime+executeQueryTime;
			String responseString = response.body().string();
			System.out.println(responseString);
			responseJson = (JSONObject) parser.parse(responseString);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return responseJson;
	}
	private void clearScroll(String scroll_id){
		MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        OkHttpClient client = new OkHttpClient();
        String query= "";
        String url = "http://localhost:9200/";
        
        if(!scroll_id.equals("")){
        	url = url+"_search/scroll";
        	query = "{\"scroll_id\":\""+scroll_id+"\"}";
        }
        
		okhttp3.RequestBody body = okhttp3.RequestBody.create(JSON, query.toString());
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        Response response;
		
		try {
			response = client.newCall(request).execute();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private JSONArray getQueryCount(String templateid, String selectedColumnAID, String selectedColumnBID, String column){
		JSONArray elements = new JSONArray();
		JSONObject listelement = null;
        
        String position = "1"; 
        if(column.equals("columnB")) position = "2"; 
        
        try {
		
	
			// template unknown, rank all senses given a position they are referenced in in a query
			// query counts per sense are sum of query counts of each template in the position of interest

			if((templateid.equals("") || templateid== null) &&
					  (column.equals("columnA") && (selectedColumnBID.equals("") || selectedColumnBID== null))
					||(column.equals("columnB") && (selectedColumnAID.equals("") || selectedColumnAID== null)) ){
				String typename  = "wordnet";
				String scroll_id = "";
				JSONObject responseJson = runQuery(typename, scroll_id);
				JSONArray hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
				System.out.println(hits.size());
				long startProcessResultsTime = System.nanoTime();
				while(hits.size()>0){
					scroll_id = (String)((JSONObject)responseJson).get("_scroll_id");
		
					for(Object o : hits){
						long querycount = 0;
						JSONObject sense = (JSONObject)((JSONObject)o).get("_source");
						JSONArray queryStats = (JSONArray)sense.get("queryStats");
						for(Object querystat:queryStats){
							Object[] keys = (((JSONObject)querystat).keySet()).toArray();
							if(keys[0].toString().endsWith(position))
							querycount = querycount + (long) ((JSONObject)querystat).get(keys[0].toString()); 
						}
						if(querycount!=0){
							listelement = new JSONObject();
							JSONObject semobject = new JSONObject();
							semobject.put("uid", sense.get("uid"));
							semobject.put("label", sense.get("label"));
							semobject.put("abstractionLevel", sense.get("abstractionLevel"));
			
							listelement.put("semobject", semobject);
							listelement.put("querycount", querycount);
							elements.add(listelement);
						}
						
					}
					responseJson = runQuery(typename, scroll_id);
					hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
					System.out.println(hits.size());
				}
				clearScroll(scroll_id);
				long processResultsTime = (System.nanoTime() - startProcessResultsTime) / 1000000;
				System.out.println("processResultsTime = "+processResultsTime+ "ms");
			
			}
			// template known,  rank all senses given a position they are referenced in in a query
			else if((templateid!=null && !templateid.equals("")) &&
					  (column.equals("columnA") && (selectedColumnBID.equals("") || selectedColumnBID== null))
					||(column.equals("columnB") && (selectedColumnAID.equals("") || selectedColumnAID== null)) ){
				String templateAndposition = "queryStats."+templateid+"_"+position;

				String typename  = "wordnet";
				String scroll_id = "";
				JSONObject responseJson = runQuery(typename, scroll_id);
				JSONArray hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
				System.out.println(hits.size());
				long startProcessResultsTime = System.nanoTime();
				while(hits.size()>0){
					scroll_id = (String)((JSONObject)responseJson).get("_scroll_id");
					
		
					for(Object o : hits){
						long querycount = 0;
						JSONObject sense = (JSONObject)((JSONObject)o).get("_source");
						JSONArray queryStats = (JSONArray)sense.get("queryStats");
						
						for(Object querystat:queryStats){
							Object[] keys = (((JSONObject)querystat).keySet()).toArray();
							if(keys[0].toString().equals(templateAndposition))
							querycount = (long) ((JSONObject)querystat).get(keys[0].toString()); 
						}
						if(querycount!=0){
							listelement = new JSONObject();
							JSONObject semobject = new JSONObject();
							semobject.put("uid", sense.get("uid"));
							semobject.put("label", sense.get("label"));
							semobject.put("abstractionLevel", sense.get("abstractionLevel"));
			
							listelement.put("semobject", semobject);
							listelement.put("querycount", querycount);
							elements.add(listelement);
						}
						
					}
					responseJson = runQuery(typename, scroll_id);
					hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
					System.out.println(hits.size());
					
				}
				clearScroll(scroll_id);
				long processResultsTime = (System.nanoTime() - startProcessResultsTime) / 1000000;
				System.out.println("processResultsTime = "+processResultsTime+ "ms");
			}
			else{
				String typename  = "querysemantics";	
				String scroll_id = "";

				JSONObject responseJson = runQuerySemanticsQuery(typename, scroll_id, templateid, selectedColumnAID, selectedColumnBID);
				
				JSONArray hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
				
				long querycount = 0;
				long startProcessResultsTime = System.nanoTime();
				while(hits.size()>0){
					scroll_id = (String)((JSONObject)responseJson).get("_scroll_id");
					for(Object o : hits){
						JSONObject qp = (JSONObject)((JSONObject)o).get("_source");
						querycount = (long)((qp).get("count"));
						
						JSONObject sense = null;
						if(selectedColumnAID.equals("")){
							sense = (JSONObject)qp.get("columnA");
						}else if(selectedColumnBID.equals("")){
							sense = (JSONObject)qp.get("columnB");
						}
						listelement = new JSONObject();
						JSONObject semobject = new JSONObject();
						semobject.put("uid", sense.get("id"));
						semobject.put("label", sense.get("label"));
						semobject.put("abstractionLevel", sense.get("abstraction"));
		
						listelement.put("semobject", semobject);
						listelement.put("querycount", querycount);
						elements.add(listelement);
						
					}
					responseJson =runQuerySemanticsQuery(typename, scroll_id, templateid, selectedColumnAID, selectedColumnBID);
					
					hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
					System.out.println(hits.size());
				}
				clearScroll(scroll_id);
				long processResultsTime = (System.nanoTime() - startProcessResultsTime) / 1000000;
				System.out.println("processResultsTime = "+processResultsTime+ "ms");
			}
		} catch (Exception e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		}
		
		return elements;
	}
	
	private JSONObject runQuerySemanticsQuery(String typename, String scroll_id,String templateid, String selectedColumnAID, String selectedColumnBID){
		JSONParser parser = new JSONParser();
		JSONObject queryString = null;
		JSONObject queryterm;
		JSONObject responseJson = null;
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

	       if(templateid!=null && !templateid.equals("") ){
				queryterm = (JSONObject) parser.parse("{\"term\":{\"template\":\""+templateid+"\"}}");
				must.add(queryterm);
				
				if(selectedColumnAID!=null && !selectedColumnAID.equals("")){
					queryterm = (JSONObject) parser.parse("{\"term\":{\"columnA.id\":\""+selectedColumnAID+"\"}}");
					must.add(queryterm);
				}
				if(selectedColumnBID!=null && !selectedColumnBID.equals("")){
					queryterm = (JSONObject) parser.parse("{\"term\":{\"columnB.id\":\""+selectedColumnBID+"\"}}");
					must.add(queryterm);
				}
				
			}
		} catch (ParseException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
       MediaType JSON = MediaType.parse("application/json; charset=utf-8");
       OkHttpClient client = new OkHttpClient();
       String url = "http://localhost:9200/";
       
       if(scroll_id.equals("")){ 
       		url = url+INDEX_NAME+"/"+typename+"/_search?scroll=1m&size=1000";
       		query = queryString.toString();
       	}
       else{
       	url = url+"_search/scroll";
       	query = "{\"scroll\":\"1m\",\"scroll_id\":\""+scroll_id+"\"}";
       	}
       
        okhttp3.RequestBody body = okhttp3.RequestBody.create(JSON, query.toString());
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        Response response;
		
		long startExecuteQueryTime = System.nanoTime();
		
		try {
			response = client.newCall(request).execute();
		
			long executeQueryTime = (System.nanoTime() - startExecuteQueryTime) / 1000000;
			System.out.println("executeQueryTime = "+executeQueryTime+ "ms");
			totalquerytime = totalquerytime+executeQueryTime;
			String responseString = response.body().string();
			System.out.println(responseString);
			responseJson = (JSONObject) parser.parse(responseString);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return responseJson;
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
