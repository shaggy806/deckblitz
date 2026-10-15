import { defineCard } from "../define.js";

// EDHREC rank 17477.
const BURN_MODE = "Artistic Process deals 6 damage to target creature.";
const SWEEP_MODE = "Artistic Process deals 2 damage to each creature you don't control.";
const TOKEN_MODE =
  "Create a 3/3 blue and red Elemental creature token with flying. It gains haste until end of turn.";

export default defineCard({
  name: "Artistic Process",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one —\n• ${BURN_MODE}\n• ${SWEEP_MODE}\n• ${TOKEN_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: BURN_MODE,
        targets: ["creature"],
        effect: { kind: "damage", amount: 6, target: 0 },
      },
      {
        text: SWEEP_MODE,
        effect: { kind: "damage-all", amount: 2, filter: { type: "creature", controlledBy: "opponent" } },
      },
      {
        text: TOKEN_MODE,
        effect: {
          kind: "create-token",
          token: "Elemental Token (3/3 Blue-Red Flying)",
          count: 1,
          gainUntilEndOfTurn: ["haste"],
        },
      },
    ],
  },
});
