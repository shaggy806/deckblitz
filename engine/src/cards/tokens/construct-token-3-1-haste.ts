import { defineCard } from "../define.js";

// A 3/1 red Construct artifact creature token with haste (Sokenzan Smelter).
export default defineCard({
  name: "Construct Token (3/1 Haste)",
  art: "cbafdfc0-380a-482b-b5f8-a7a00ecf8da6",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste",
});
