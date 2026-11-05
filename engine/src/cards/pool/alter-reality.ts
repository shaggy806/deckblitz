import { defineCard } from "../define.js";

// EDHREC rank 15518.

export default defineCard({
  name: "Alter Reality",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{1}{U}" },
  text: "Change the text of target spell or permanent by replacing all instances of one color word with another. (This effect lasts indefinitely.)\nFlashback {1}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "change-text", target: 0, words: "color", duration: "permanent" },
});
