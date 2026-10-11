import { useState } from "react";
import ThemeEditor from "./ThemeEditor";

const SECTIONS = [
  { key: "hero", title: "Hero Slider" },
  { key: "featured", title: "Öne Çıkanlar" },
  { key: "categories", title: "Kategoriler" },
  { key: "gallery", title: "Mutfağımızdan Kareler" },
  { key: "video", title: "Video Bölümü" },
];

function AdminHomePageSections() {
  const [selectedSection, setSelectedSection] = useState(null);

  return (
    <div>
      {!selectedSection && (
        <div>
          <h2>Anasayfa Bölümleri</h2>

          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSelectedSection(s)}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {selectedSection && (
        <ThemeEditor
          section={selectedSection}
          onBack={() => setSelectedSection(null)}
        />
      )}
    </div>
  );
}

export default AdminHomePageSections;
