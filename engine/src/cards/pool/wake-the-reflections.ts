import { defineCard } from "../define.js";

// EDHREC rank 12583.

export default defineCard({
  name: "Wake the Reflections",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Populate. (Create a token that's a copy of a creature token you control.)",
  effect: { kind: "populate" },
});
