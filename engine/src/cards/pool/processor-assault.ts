import { defineCard } from "../define.js";

// A processor's additional cost (`additionalCost.putFromExile`): exactly one
// card an opponent owns from exile, chosen once the spell is on the stack
// (601.2h); uncastable without one (the rulings).

export default defineCard({
  name: "Processor Assault",
  manaCost: "{1}{R}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nAs an additional cost to cast this spell, put a card an opponent owns from exile into that player's graveyard.\nProcessor Assault deals 5 damage to target creature.",
  additionalCost: { putFromExile: 1 },
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: 5 },
});
