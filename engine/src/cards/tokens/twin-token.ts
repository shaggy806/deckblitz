import { defineCard } from "../define.js";

// A colorless Construct artifact creature token *named* Twin, its P/T set as
// it's made (`create-token`'s `basePt` — Gemini Engine). Keyed " Token",
// named by `tokenName`.

export default defineCard({
  name: "Twin Token",
  tokenName: "Twin",
  art: "0f3954f9-776d-4a8d-a032-724c4eae0e13",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  text: "",
});
