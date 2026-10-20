import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 15193.
export default defineCard({
  name: "Dwarven Reinforcements",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create two 2/1 red Dwarf Berserker creature tokens.\nForetell {1}{R} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{1}{R}" },
  targets: [],
  effect: { kind: "create-token", token: "Dwarf Berserker Token", count: 2 },
});
