package actions;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import control.Action;

public class SaveWordNetConcepts implements Action {

	@Override
	public boolean execute(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		// TODO Auto-generated method stub
		System.out.println("in SaveWordNetConcepts");

    	InputStream inputStream = null;
    	OutputStream outputStream = null;
		    	
        try {
    		// read this file into InputStream
    		inputStream = req.getInputStream();
    		
//    		BufferedReader br = new BufferedReader(new InputStreamReader(req.getInputStream()));
//            String json = "";
//            if(br != null){
//                json = br.readLine();
//                System.out.println(json);
//            }
    		// write the inputStream to a FileOutputStream
    		outputStream = new FileOutputStream(new File("/Users/christina 1/git/VIQS/WebContent/data/concepts.json"));

    		int read = 0;
    		byte[] bytes = new byte[1024];

    		while ((read = inputStream.read(bytes)) != -1) {
    			outputStream.write(bytes, 0, read);
    		}
    		return true; 
    	} catch (IOException e) {
    		e.printStackTrace();
    	} finally {
    		if (inputStream != null) {
    			try {
    				inputStream.close();
    			} catch (IOException e) {
    				e.printStackTrace();
    			}
    		}
    		if (outputStream != null) {
    			try {
    				// outputStream.flush();
    				outputStream.close();
    			} catch (IOException e) {
    				e.printStackTrace();
    			}

    		}
    	}


		System.out.println("done");
		
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
