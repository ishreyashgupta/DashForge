import  {Navigate} from "react-router-dom"

const PrivateRoute  = ({childern}) =>  {
     const token = localStorage.getItem("token");
    return token ? childern : <Navigate to ="/login "/>;
};

export default PrivateRoute;
