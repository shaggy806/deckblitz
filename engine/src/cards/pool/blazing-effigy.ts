import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, it deals X damage to target creature, where X is 3 plus the amount of damage dealt to this creature this turn by other sources named Blazing Effigy.";

export default defineCard({
  name: "Blazing Effigy",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 3,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "damage",
        target: 0,
        amount: {
          sum: [
            3,
            { damageDealtThisTurn: true, who: "each-player", to: "source", by: { name: "Blazing Effigy", other: true } },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
