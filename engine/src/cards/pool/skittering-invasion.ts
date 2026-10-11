import { defineCard } from "../define.js";

export default defineCard({
  name: "Skittering Invasion",
  manaCost: "{7}",
  colors: [],
  types: ["kindred", "sorcery"],
  subtypes: ["Eldrazi"],
  text: 'Create five 0/1 colorless Eldrazi Spawn creature tokens. They have "Sacrifice this token: Add {C}."',
  effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 5 },
});
