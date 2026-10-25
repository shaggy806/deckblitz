import { defineCard } from "../define.js";

// Homelands. EDHREC rank 27791.
export default defineCard({
  name: "Ambush",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Blocking creatures gain first strike until end of turn.",
  effect: {
    kind: "grant-keyword-all",
    filter: { type: "creature", blocking: true },
    keyword: "first-strike",
    duration: "end-of-turn",
  },
});
