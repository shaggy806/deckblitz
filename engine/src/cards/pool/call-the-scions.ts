import { defineCard } from "../define.js";

// EDHREC rank 13004. Devoid: no colors.

export default defineCard({
  name: "Call the Scions",
  manaCost: "{2}{G}",
  colors: [],
  types: ["sorcery"],
  text: 'Devoid (This card has no color.)\nCreate two 1/1 colorless Eldrazi Scion creature tokens. They have "Sacrifice this token: Add {C}."',
  targets: [],
  effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 2 },
});
