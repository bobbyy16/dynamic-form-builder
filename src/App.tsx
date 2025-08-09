import CreateForm from "./pages/CreateForm";
import Home from "./pages/Home";
import PreviewForm from "./pages/PreviewForm";
import ViewAllForms from "./pages/ViewAllForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateForm />} />
        <Route path="/preview" element={<PreviewForm />} />
        <Route path="/myforms" element={<ViewAllForms />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
