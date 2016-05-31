package actions;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import control.Action;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class GetTemplateList implements Action {
	

	 private static final String INDEX_NAME = "viqs";
	 private long totalquerytime = 0;

	@Override
	public boolean execute(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		String selectedColumnAID = req.getParameter("selectedColumnAID");
		String selectedColumnBID = req.getParameter("selectedColumnBID");
		
		JSONArray elements = getTemplateRankingByQueryCount(selectedColumnAID, selectedColumnBID);
		
        res.setContentType("application/json");
        PrintWriter aPrint = res.getWriter();

        aPrint.print(elements.toString());
        return true;
	}

	private JSONArray getTemplateRankingByQueryCount(String selectedColumnAID, String selectedColumnBID) {
		JSONArray elements = new JSONArray();
		JSONObject listelement = null;
		

		String typename  = "querysemantics";	
		String scroll_id = "";

		JSONObject responseJson = runQuerySemanticsQuery(typename, scroll_id, selectedColumnAID, selectedColumnBID);
		
		JSONArray buckets = (JSONArray)((JSONObject) ((JSONObject)(responseJson).get("aggregations")).get("group_by_template")).get("buckets");
		
		long startProcessResultsTime = System.nanoTime();
		
		for(Object o : buckets){
			String template = (String)((JSONObject)o).get("key");
			double count = (double)((JSONObject)((JSONObject)o).get("total_querycount")).get("value");
			
			listelement = new JSONObject();
			
			listelement.put("template", template);
			listelement.put("querycount", count);
			elements.add(listelement);
		}
			
		long processResultsTime = (System.nanoTime() - startProcessResultsTime) / 1000000;
		System.out.println("processResultsTime = "+processResultsTime+ "ms");
		
		return elements;
	}
	
	
	private JSONObject runQuerySemanticsQuery(String typename, String scroll_id, String selectedColumnAID, String selectedColumnBID){
		JSONParser parser = new JSONParser();
		JSONObject queryString = null;
		JSONObject queryterm;
		JSONObject responseJson = null;
		String query = "{ \"size\": 0,"// return only aggregations
				+ "		  \"query\":{"
				+ "			\"filtered\":{"
				+ "				\"filter\":{"
				+ "					\"bool\":{"
				+ "						\"must\":[]"
				+ "					}"
				+ "				}"
				+ "			}"
				+ "		},"
				+ "		\"aggs\": {"
				+ "			\"group_by_template\": {"
				+ "         	\"terms\": {"
				+ "					\"field\": \"template\""
				+ "				},"
				+ "				\"aggs\": {"
				+ "					\"total_querycount\": {"
				+ " 					\"sum\": {"
				+ " 						\"field\": \"count\""
          		+ "						}"
          		+ "					}"
          		+ "				}"
          		+ "			}"
          		+ "		}"
				+ "	}";
		try {
			queryString = (JSONObject) parser.parse(query);
		
		JSONArray must = (JSONArray) ((JSONObject)((JSONObject)((JSONObject)((JSONObject)queryString.get("query")).get("filtered")).get("filter")).get("bool")).get("must");

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
       
       
       url = url+INDEX_NAME+"/"+typename+"/_search?";
       query = queryString.toString();
       
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
