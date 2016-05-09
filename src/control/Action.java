package control;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;

/**
 * Interface for Action objects 
 * 
 * <p>This interface is used to provide a generic interface to Action objects, 
 * which are used to implement a request action. Action object are actually 
 * commnad objects</p> 
 *
 * <p> The Action interface defines three core methods: execute, getView and
 * getModel</p>
 *
 * <p>The execute method, when implemented, will perform any necessary business
 * logic needed to carry out the request</p>
 *
 * <p>The getView and getModel methods are used to return the page and data
 * necessary to present the results of the action</p>
 */

public interface Action {
   
  
   /** Execute business logic */
   public boolean execute(HttpServletRequest req, HttpServletResponse res)
     throws ServletException, IOException;
   
   /** Return the page name (and path) to display the view */
   public String getView();
   
   /** Return a JavaBean containing the model (data) */
   public Object getModel();   
}
