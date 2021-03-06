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
	 private static final String RESULT_SIZE = "1000";

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
	
	
	private JSONArray getQueryCount(String templateid, String selectedColumnAID, String selectedColumnBID, String column){
		JSONArray elements = new JSONArray();
		JSONObject listelement = null;
        
        String position = "1"; 
        if(column.equals("columnB")) position = "2"; 
        
        try {
		
	
			// template unknown, rank all senses given a position they are referenced in in a query
			// query counts per sense are sum of query counts of each template in the position of interest

			if((templateid.equals("") || templateid== null) &&(
					  (column.equals("columnA") && (selectedColumnBID.equals("") || selectedColumnBID== null))
					||(column.equals("columnB") && (selectedColumnAID.equals("") || selectedColumnAID== null)) )){
				String typename  = "wordnet";
				String scroll_id = "";
				JSONObject responseJson = runQuerySum(typename, scroll_id, position);
				JSONArray hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
				System.out.println(hits.size());
				long startProcessResultsTime = System.nanoTime();
				while(hits.size()>0){
					scroll_id = (String)((JSONObject)responseJson).get("_scroll_id");
		
					for(Object o : hits){
						long querycount = 0;
						JSONObject source = (JSONObject)((JSONObject)o).get("_source");

						JSONObject sense = (JSONObject)((JSONObject)o).get("fields");

						listelement = new JSONObject();
						JSONObject semobject = new JSONObject();
						semobject.put("uid", (String)((JSONArray)sense.get("uid")).get(0));
						semobject.put("label", (String)((JSONArray)sense.get("label")).get(0));
						semobject.put("abstractionLevel", (long)((JSONArray)sense.get("abstractionLevel")).get(0));
		
						listelement.put("semobject", semobject);
						listelement.put("querycount", (long)((JSONArray)sense.get("queryCount")).get(0));
						elements.add(listelement);	
					}
					responseJson = runQuerySum(typename, scroll_id, position);
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
				JSONObject responseJson = runQuery(typename, scroll_id, templateAndposition);
				JSONArray hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
				System.out.println(hits.size());
				long startProcessResultsTime = System.nanoTime();
				while(hits.size()>0){
					scroll_id = (String)((JSONObject)responseJson).get("_scroll_id");
					for(Object o : hits){
						JSONObject sense = (JSONObject)((JSONObject)o).get("fields");

						JSONArray queryStats = (JSONArray)sense.get(templateAndposition);

						if((long)queryStats.get(0)!=0){
							listelement = new JSONObject();
							JSONObject semobject = new JSONObject();
							semobject.put("uid", (String)((JSONArray)sense.get("uid")).get(0));
							semobject.put("label", (String)((JSONArray)sense.get("label")).get(0));
							semobject.put("abstractionLevel", (long)((JSONArray)sense.get("abstractionLevel")).get(0));
							listelement.put("semobject", semobject);
							listelement.put("querycount", (long)queryStats.get(0));
							elements.add(listelement);
						}
						
					}
					responseJson = runQuery(typename, scroll_id, templateAndposition);
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

				JSONObject responseJson = runQuerySemanticsQuery(typename, scroll_id, templateid, selectedColumnAID, selectedColumnBID, column);
				
				JSONArray hits = (JSONArray) ((JSONObject)(responseJson).get("hits")).get("hits");
				
				long querycount = 0;
				long startProcessResultsTime = System.nanoTime();
				while(hits.size()>0){
					scroll_id = (String)((JSONObject)responseJson).get("_scroll_id");
					for(Object o : hits){
//						JSONObject qp = (JSONObject)((JSONObject)o).get("_source");
						JSONObject qp = (JSONObject)((JSONObject)o).get("fields");
						querycount = (long)((JSONArray)((qp).get("count"))).get(0);//todo: deal w null pointer exception
						
						String	senseid = (String) ((JSONArray)((qp).get(column+".id"))).get(0);
						String	senselabel = (String) ((JSONArray)((qp).get(column+".label"))).get(0);
						String	senseAbstraction= (String)((JSONArray)((qp).get(column+".abstractionLevel"))).get(0);
						
						listelement = new JSONObject();
						JSONObject semobject = new JSONObject();
						semobject.put("uid", senseid);
						semobject.put("label", senselabel);
						semobject.put("abstractionLevel", senseAbstraction);
		
						listelement.put("semobject", semobject);
						listelement.put("querycount", querycount);
						elements.add(listelement);
						
					}
					responseJson =runQuerySemanticsQuery(typename, scroll_id, templateid, selectedColumnAID, selectedColumnBID, column);
					
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
	private JSONObject runQuery(String typename, String scroll_id, String template){
		JSONParser parser = new JSONParser();
		JSONObject queryString = null;
		JSONObject queryterm;
		JSONObject responseJson = null;
		MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        OkHttpClient client = new OkHttpClient();
        String query;
        String url = "http://localhost:9200/";
        
        if(scroll_id.equals("")){ 
        	url = url+INDEX_NAME+"/"+typename+"/_search?scroll=1m&size="+RESULT_SIZE;
        	if(template!=null && !template.equals(""))
        		query = "{\"fields\":[\"uid\",\"label\",\"abstractionLevel\",\""+template+"\" ],"
    			+ "\"query\":{\"bool\": {\"must\": [{\"range\": {\""+template+"\": {\"gte\":0}}}]}},"//make sure the querycount is above 0, otherwise dont return it
    			+ "\"sort\": { \""+template+"\": { \"order\": \"desc\" }}}";
        	else
        		query = "{\"_source\":[\"queryStats\"]," //queryStats is not a leaf node
        			+ "\"fields\":[\"uid\",\"label\",\"abstractionLevel\" ],"
        			+ "\"query\":{\"match_all\" : {}}}";
        	}
        else{
        	url = url+"_search/scroll";
        	query = "{\"scroll\":\"1m\",\"scroll_id\":\""+scroll_id+"\"}";
        	}
        System.out.println(query.toString());
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
	
	private JSONObject runQuerySum(String typename, String scroll_id, String position){
		JSONParser parser = new JSONParser();
		JSONObject queryString = null;
		JSONObject queryterm;
		JSONObject responseJson = null;
		MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        OkHttpClient client = new OkHttpClient();
        String query;
        String url = "http://localhost:9200/";
       
        if(scroll_id.equals("")){ 
        	url = url+INDEX_NAME+"/"+typename+"/_search?scroll=1m&size="+RESULT_SIZE;
        	query = "{\"fields\":[\"uid\",\"label\",\"abstractionLevel\" ],"
        			+ "\"script_fields\" : "
        			+ "	{\"queryCount\" : "
        			+ "		{\"script\" : \"_source.queryStats.findAll{ (it.keySet()[0]).endsWith('_"+position+"') }.collect{it.values()}.flatten().sum()\"}"
        			+ "	},"
        			+ "\"filter\" : {"//make sure the querycount is above 0, otherwise don't bother returning it
        			+ "	\"script\" : {"
        			+ "		\"script\" : \"_source.queryStats.findAll{ (it.keySet()[0]).endsWith('_"+position+"') }.collect{it.values()}.flatten().sum() > 0\""
        					+ "}"
            		+ "},"
            		+ "\"query\":{\"match_all\" : {}}"
            		+ "}";
        	
        }
        else{
        	url = url+"_search/scroll";
        	query = "{\"scroll\":\"1m\",\"scroll_id\":\""+scroll_id+"\"}";
        	}
        System.out.println(query.toString());
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
	private JSONObject runQuerySemanticsQuery(String typename, String scroll_id,String templateid, String selectedColumnAID, String selectedColumnBID, String column){
		JSONParser parser = new JSONParser();
		JSONObject queryString = null;
		JSONObject queryterm;
		JSONObject responseJson = null;
		String query = "{ \"fields\":[\"count\",\""+column+".id\",\""+column+".label\",\""+column+".abstractionLevel\" ],\"query\":"
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
			}
	       if(selectedColumnAID!=null && !selectedColumnAID.equals("")){
				queryterm = (JSONObject) parser.parse("{\"term\":{\"columnA.id\":\""+selectedColumnAID+"\"}}");
				must.add(queryterm);
			}
			if(selectedColumnBID!=null && !selectedColumnBID.equals("")){
				queryterm = (JSONObject) parser.parse("{\"term\":{\"columnB.id\":\""+selectedColumnBID+"\"}}");
				must.add(queryterm);
			}
		} catch (ParseException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
       MediaType JSON = MediaType.parse("application/json; charset=utf-8");
       OkHttpClient client = new OkHttpClient();
       String url = "http://localhost:9200/";
       
       if(scroll_id.equals("")){ 
       		url = url+INDEX_NAME+"/"+typename+"/_search?scroll=1m&size="+RESULT_SIZE;
       		
       		query = queryString.toString();
       	}
       else{
       	url = url+"_search/scroll";
       	query = "{\"scroll\":\"1m\",\"scroll_id\":\""+scroll_id+"\"}";
       	}
        System.out.println(query.toString());
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
