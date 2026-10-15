import { defineCard } from "../define.js";

// EDHREC rank 11143. The damage is the lands you control as it resolves.

const DAMAGE_MODE = "Bumi Bash deals damage equal to the number of lands you control to target creature.";
const DESTROY_MODE = "Destroy target land creature or nonbasic land.";

export default defineCard({
  name: "Bumi Bash",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one —\n• ${DAMAGE_MODE}\n• ${DESTROY_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DAMAGE_MODE,
        targets: ["creature"],
        effect: { kind: "damage", target: 0, amount: { countOf: { type: "land", controlledBy: "you" } } },
      },
      {
        text: DESTROY_MODE,
        targets: [
          {
            kind: "permanent",
            filter: { type: "land", anyOf: [{ type: "creature" }, { notSupertype: "basic" }] },
          },
        ],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
