import { defineCard } from "../define.js";

export default defineCard({
  name: "Magmatic Sinkhole",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["instant"],
  delve: true,
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nMagmatic Sinkhole deals 5 damage to target creature or planeswalker.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 5, target: 0 },
});
