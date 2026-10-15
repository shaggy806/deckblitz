import { defineCard } from "../define.js";

// EDHREC rank 19214. A modal spell: its mode is chosen as it's cast (rule
// 700.2a), each mode with its own target.

const DESTROY_MODE = "Destroy target Vehicle.";
const DAMAGE_MODE = "Crash and Burn deals 6 damage to target creature or planeswalker.";

export default defineCard({
  name: "Crash and Burn",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${DESTROY_MODE}\n• ${DAMAGE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DESTROY_MODE,
        targets: [{ kind: "permanent", filter: { subtype: "Vehicle" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: DAMAGE_MODE,
        targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "damage", amount: 6, target: 0 },
      },
    ],
  },
});
