import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 17869.
//
// Lifelace's shape with no colours: the change doesn't wear off, and a spell
// made colourless stays so as the permanent it becomes (the rulings).
export default defineCard({
  name: "Moonlace",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target spell or permanent becomes colorless.",
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "become-color", target: 0, colors: [], duration: "permanent" },
});
