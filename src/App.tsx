import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import "./App.css";
import AppRouter from "./router/router";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="bottom-center"
        reverseOrder={false}
      />
    </>
  );
}

export default App;
