import { defineCard } from "../define.js";

// EDHREC rank 23104. Khans of Tarkir.

export default defineCard({
  name: "Set Adrift",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nPut target nonland permanent on top of its owner's library.",
  delve: true,
  targets: ["nonland-permanent"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
