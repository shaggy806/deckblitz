import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Whenever this creature or another Vampire you control dies, you may pay {B}. If you do, target player loses 2 life and you gain 2 life.";

// The player is targeted as it triggers; {B} is paid, once, as it resolves
// (the rulings).
export default defineCard({
  name: "Kalastria Highborn",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "dies", who: "you-control", filter: { subtype: "Vampire" } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Pay {B}: target player loses 2 life and you gain 2 life?",
        cost: "{B}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 2, target: 0 },
            { kind: "gain-life", amount: 2, who: "you" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
