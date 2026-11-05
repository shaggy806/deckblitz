import { defineCard } from "../define.js";

// EDHREC rank 26234.

export default defineCard({
  name: "Identity Crisis",
  manaCost: "{2}{W}{W}{B}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Exile all cards from target player's hand and graveyard.",
  targets: ["player"],
  effect: { kind: "exile-graveyard", target: 0, fromHand: "also" },
});
