import { defineCard } from "../define.js";

/** X/X green Phyrexian Wurm creature token with trample and toxic 1 —
 * Wurmquake's. Its X is set as it's made (`create-token`'s `basePt`); 0/0
 * is only the placeholder. */
export default defineCard({
  name: "Phyrexian Wurm Token",
  art: "594c55d3-d435-4dec-bc92-011442a43684",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wurm"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  toxic: 1,
  text: "Trample\nToxic 1 (Players dealt combat damage by this creature also get a poison counter.)",
});
