import { defineCard } from "../define.js";

// Portal Three Kingdoms. EDHREC rank 28708.

export default defineCard({
  name: "Guan Yu's 1,000-Li March",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all tapped creatures.",
  effect: { kind: "destroy-all", filter: { type: "creature", tapped: true } },
});
