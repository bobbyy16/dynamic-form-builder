import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import CreateForm from "./pages/CreateForm";
import EditForm from "./pages/EditForm";
import PreviewForm from "./pages/PreviewForm";
import ViewAllForms from "./pages/ViewAllForms";
import Responses from "./pages/Responses";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateForm />} />
          <Route path="/edit" element={<EditForm />} />
          <Route path="/preview" element={<PreviewForm />} />
          <Route path="/myforms" element={<ViewAllForms />} />
          <Route path="/responses" element={<Responses />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
