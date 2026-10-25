import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// Zendikar (ZEN). EDHREC rank 16513. The target is chosen as the ability
// triggers; whether to deal the damage, and the Ally count, as it resolves
// (the rulings).

const TEXT =
  "Whenever this creature or another Ally you control enters, you may have this creature deal damage to target creature equal to the number of Allies you control.";

export default defineCard({
  name: "Murasa Pyromancer",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Ally"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Murasa Pyromancer deal damage to the target creature equal to the number of Allies you control?",
        effect: { kind: "damage", amount: { countOf: { subtype: "Ally", controlledBy: "you" } }, target: 0 },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
