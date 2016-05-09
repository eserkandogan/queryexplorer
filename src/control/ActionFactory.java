package control;

/**  
 * Factory class for Action objects
 *
 * <p>Generates an object that implements the Action interface. The createAction 
 * method is called from the RequestUtility object to instantiate an Action 
 * object to handle a web request.</p>
 * 
 * <p> The factory itself is implemented as an abstract class because the 
 * factory should never be instantiated. Its only purpose is to return objects
 * that implement the Action interface.</p>
 *
 * <p> It has only one static method that takes as a String parameter a fully
 * qualified class name and using Java Reflection instantiate and return the
 * object </p>
 */

public abstract class ActionFactory {   
   
   /**
    * Instantiate and return the appropriate
    * Action object
    */
   public static Action createAction(String actionClassName) {

      Action action = null;

      try {
         Class c = getClass(actionClassName);
         action = (Action) c.newInstance();
      }
       catch(ClassNotFoundException cnf) {
         System.out.println( "Couldn't find class " + actionClassName);    
       }
       catch(InstantiationException ie) {
         System.out.println( "Couldn't instantiate an object of type " + actionClassName);    
       }
       catch(IllegalAccessException ia) {
         System.out.println("Couldn't access class " + actionClassName);    
       }
       return action;    
   }
   
  /**
   * Returns a Class object for the given class name.
   * <p>
   * Because multiple classloaders are commonly used in many situations
   * you can wind up with multiple singleton instances no matter how carefully 
   * you've implemented your singleton classes. If you want to make sure the 
   * same classloader loads your singletons, you must specify the classloader 
   * yourself.
   * <p>
   * The method tries to associate the classloader with the current thread. if 
   * that classloader is null, the method uses the same classloader that loaded 
   * the SingletonRegistry class. The method is used instead of Class.forName().   
   *
   * @return Class object of the given class name
   */
   private static Class getClass(String classname) 
      throws ClassNotFoundException {

      ClassLoader classLoader = Thread.currentThread().getContextClassLoader();

      if(classLoader == null)
         classLoader = ActionFactory.class.getClassLoader();

      return (classLoader.loadClass(classname));
  }
}
