package actions;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import control.Action;

public class SaveWordnetBulk implements Action {

	@Override
	public boolean execute(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		System.out.println("in SaveWordnetBulk");

		InputStream inputStream = null;
    	OutputStream outputStream = null;
		String filename = req.getParameter("filename");    	
        try {
    		inputStream = req.getInputStream();
    		// write the inputStream to a FileOutputStream
    		outputStream = new FileOutputStream(new File("/Users/christina 1/git/VIQS/WebContent/data/WordnetBulk/"+filename+".json"));

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


		System.out.println("Done saving "+filename);
		return true;
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
