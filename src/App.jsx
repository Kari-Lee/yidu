import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Diagnose from "./pages/Diagnose";
import Translate from "./pages/Translate";
import Check from "./pages/Check";
import Predict from "./pages/Predict";
import Tarot from "./pages/Tarot";
import Qian from "./pages/Qian";
import Bazi from "./pages/Bazi";
import Fortune from "./pages/Fortune";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="diagnose" element={<Diagnose />} />
          <Route path="translate" element={<Translate />} />
          <Route path="check" element={<Check />} />
          <Route path="predict" element={<Predict />} />
          <Route path="tarot" element={<Tarot />} />
          <Route path="qian" element={<Qian />} />
          <Route path="bazi" element={<Bazi />} />
          <Route path="fortune" element={<Fortune />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
