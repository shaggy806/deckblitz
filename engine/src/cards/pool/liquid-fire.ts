import { defineCard } from "../define.js";

// The number is chosen as the spell is cast (the ruling), so it's announced
// like an X (`additionalCost.chooseNumber`) and `"x"` reads it. A number, not a
// mode: it isn't a modal spell (rule 700.2), and its mana value doesn't count it.
export default defineCard({
  name: "Liquid Fire",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, choose a number between 0 and 5.\n" +
    "Liquid Fire deals X damage to target creature and 5 minus X damage to that creature's controller, where X is the chosen number.",
  additionalCost: { chooseNumber: { min: 0, max: 5 } },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "damage", amount: { sum: [5, { product: ["x", -1] }] }, who: { controllerOf: 0 } },
    ],
  },
});
