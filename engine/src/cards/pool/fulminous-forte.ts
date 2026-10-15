import { defineCard } from "../define.js";

// EDHREC rank 27323.

const SWEEP_MODE = "Fulminous Forte deals 1 damage to each creature and planeswalker your opponents control.";
const BOLT_MODE = "Fulminous Forte deals 5 damage to target creature or planeswalker.";

export default defineCard({
  name: "Fulminous Forte",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${SWEEP_MODE}\n• ${BOLT_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: SWEEP_MODE,
        targets: [],
        effect: {
          kind: "damage-all",
          amount: 1,
          filter: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "opponent" },
        },
      },
      {
        text: BOLT_MODE,
        targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "damage", amount: 5, target: 0 },
      },
    ],
  },
});
