package actions;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import static java.nio.file.Files.readAllBytes;
import static java.nio.file.Paths.get;

import control.Action;

public class CreateQSPBulk implements Action {

	@Override
	public boolean execute(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		System.out.println("in CreateQSPBulk");

		String qspdirectory = "/Users/christina 1/git/VIQS/WebContent/data/QuerySemanticPermutations/";
		String jsonstring =  new String(readAllBytes(get(qspdirectory+"qsp_1.json")));
		JSONParser parser = new JSONParser();
		String content = "";
		try {
			JSONArray qsps = (JSONArray) parser.parse(jsonstring);
//			for(int i= 0; i<qsps.size(); i++){
			for(int i= 0; i<10; i++){

				JSONObject querySemPermutation = (JSONObject) qsps.get(i);
				JSONObject qspindex = new JSONObject();
				JSONObject qspindexentry = new JSONObject();
				qspindexentry.put("_index", "viqs");
				qspindexentry.put("_type", "querysemantics");
				qspindexentry.put("_id", querySemPermutation.get("qspid"));
				qspindex.put("index", qspindexentry);
				
				content = content+ qspindex.toString()+"\n"+querySemPermutation.toString()+"\n";
	
			}
			File file = new File("/Users/christina 1/git/VIQS/WebContent/data/BULK/qsp.json");

			// if file doesnt exists, then create it
			if (!file.exists()) {
				file.createNewFile();
			}
			FileWriter fw = new FileWriter(file.getAbsoluteFile());
			BufferedWriter bw = new BufferedWriter(fw);
			bw.write(content);
			bw.close();
			
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return false;
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
