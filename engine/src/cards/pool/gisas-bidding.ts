import { defineCard } from "../define.js";

// EDHREC rank 13671.

export default defineCard({
  name: "Gisa's Bidding",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  madness: { cost: "{2}{B}" },
  text: "Create two 2/2 black Zombie creature tokens.\nMadness {2}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  effect: { kind: "create-token", token: "Zombie Token", count: 2 },
});
