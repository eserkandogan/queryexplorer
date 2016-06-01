package actions;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.StringTokenizer;

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

public class GetConceptComboList implements Action {
	private static final String INDEX_NAME = "viqs";
	 private long totalquerytime = 0;
	 
	@Override
	public boolean execute(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		
		JSONArray elements = getTemplateRankingByQueryCount();
		
        res.setContentType("application/json");
        PrintWriter aPrint = res.getWriter();

        aPrint.print(elements.toString());
        return true;
	}

	private JSONArray getTemplateRankingByQueryCount() {
		JSONArray elements = new JSONArray();
		JSONObject listelement = null;
		
		JSONObject responseJson = runQuerySemanticsQuery();
		System.out.println(responseJson);
		JSONArray buckets = (JSONArray)((JSONObject) ((JSONObject)(responseJson).get("aggregations")).get("col1_col2_labels")).get("buckets");
		
		long startProcessResultsTime = System.nanoTime();

		for(Object o : buckets){
			String key = (String)((JSONObject)o).get("key");
			StringTokenizer stok = new StringTokenizer(key," # ");

			double count = (double)((JSONObject)((JSONObject)o).get("total_querycount")).get("value");
			String columnAid,columnAlabel, columnBid,columnBlabel;
			String token = stok.nextToken();
			if(token.indexOf("null_")==-1){
				 columnAid = token.substring(0, token.indexOf("_", token.indexOf("_")+1));
				 columnAlabel = token.substring(columnAid.length()+1, token.length());
				}
			else {
				 columnAid = "null";
				 columnAlabel = "null";
				}
			
			token = stok.nextToken();
			if(token.indexOf("null_")==-1){	
				 columnBid = token.substring(0, token.indexOf("_", token.indexOf("_")+1));
				 columnBlabel = token.substring(columnBid.length()+1, token.length());
				}
			else {
				 columnBid = "null";
				 columnBlabel = "null";
			}
			
			listelement = new JSONObject();
			
			JSONObject columnA = new JSONObject();
			columnA.put("id", columnAid);
			columnA.put("label", columnAlabel);
			listelement.put("columnA", columnA);
			
			JSONObject columnB = new JSONObject();
			columnB.put("id", columnBid);
			columnB.put("label", columnBlabel);
			listelement.put("columnB", columnB);
			
			listelement.put("querycount", count);
			elements.add(listelement);
		}
			
		long processResultsTime = (System.nanoTime() - startProcessResultsTime) / 1000000;
		System.out.println("processResultsTime = "+processResultsTime+ "ms");
		
		return elements;
	}
	
	
	private JSONObject runQuerySemanticsQuery(){
		JSONParser parser = new JSONParser();
		JSONObject queryString = null;
		JSONObject queryterm;
		JSONObject responseJson = null;
		String query = "{"
					+ "		\"aggs\": {"
					+ "			\"col1_col2_labels\": {"
					+ "				\"terms\": {"
					+ "					\"script\" : \"doc['columnA.id'].value + '_' +doc['columnA.label'].value + ' # ' + doc['columnB.id'].value + '_' +doc['columnB.label'].value\","
					+ "					\"order\":{ \"total_querycount\": \"desc\"},"
					+ "					\"size\":100"
					+ "				},"
					+ "				\"aggs\": {"
					+ "					\"total_querycount\": {"
					+ "						\"sum\": {\"field\": \"count\"}"
					+ "					}"
					+ "				}"
					+ "			}"
					+ "		}"
					+ "	}";
		
       MediaType JSON = MediaType.parse("application/json; charset=utf-8");
       OkHttpClient client = new OkHttpClient();
       String url = "http://localhost:9200/";
       
       
       url = url+INDEX_NAME+"/querysemantics/_search?search_type=count";       
        System.out.println(query.toString());
        okhttp3.RequestBody body = okhttp3.RequestBody.create(JSON, query.toString());
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        System.out.println(request);
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
