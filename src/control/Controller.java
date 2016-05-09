package control;

import java.io.IOException;
import java.util.HashMap;
import javax.servlet.*;
import javax.servlet.http.*;

public class Controller extends HttpServlet {

    /** The HashMap events is used to hold the action/event definitions: */
    protected HashMap actions = new HashMap();

    /**
     * The init() method reads the events from a properties file and inserts them 
     * into the event handler table. An action/event definition consists of an 
     * action/event name and the corresponding handler class: 
     *
     * @throws javax.servlet.ServletException
     */
    @Override
    public void init() throws ServletException {
        super.init();
        actions.put("SAVE_WORDNET", "actions.SaveWordNetConcepts");
        actions.put("SAVE_TAGS", "actions.SaveTagConcepts");
        actions.put("SAVE_QSP", "actions.SaveQuerySemanticPermutations");
        actions.put("SAVE_QSP_BULK", "actions.SaveQSPBulk");
        actions.put("SAVE_WORDNET_BULK", "actions.SaveWordnetBulk");
        actions.put("CALC_QUERY_COUNTS", "actions.CalculateQueryCounts");
        		
        actions.put("CREATE_QSP_BULK", "actions.CreateQSPBulk");
    }

    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        /* Wrap request object with helper */
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

//        System.out.println("-----------------------------------%ACTIONS:" + actions);
        RequestUtility reqUtil = new RequestUtility(request, actions);

        /* Create an Action object based on request parameters */
        Action action = reqUtil.getAction();

        System.out.println("-----------------------------------IN CONTROLLER");
//        System.out.println("-----------------------------------%reqUtil:" + reqUtil + " ----- ACT:" + action);

        /* Execute business logic */
        if (action != null && action.execute(request, response)) {

            /* Get appropriate view for action */
            String view = action.getView();

            /* Add the model to the request attributes */
            request.setAttribute("model", action.getModel());


            System.out.println("-----------------------------------VIEW:" + action.getView());

            /* Forward the request to the given view */
            if (view != null) {
                RequestDispatcher dispatcher = request.getRequestDispatcher(view);
                dispatcher.forward(request, response);
            }
        }

    }    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">

    /** 
     * Handles the HTTP <code>GET</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    // @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Handles the HTTP <code>POST</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    //   @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Returns a short description of the servlet.
     * @return a String containing servlet description
     */
    //  @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
