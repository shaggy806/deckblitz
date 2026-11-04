import { defineCard } from "../define.js";

export default defineCard({
  name: "Voidslime",
  manaCost: "{G}{U}{U}",
  colors: ["G", "U"],
  types: ["instant"],
  text: "Counter target spell, activated ability, or triggered ability. (Mana abilities can't be targeted.)",
  targets: [{ kind: "stack", spells: "any", abilities: true }],
  effect: { kind: "counter", target: 0 },
});
