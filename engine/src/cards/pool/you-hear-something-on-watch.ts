import { defineCard } from "../define.js";

// EDHREC rank 20845. The mode names are ability-word flavor (they change
// nothing).

const ROUSE_TEXT = "Rouse the Party — Creatures you control get +1/+1 until end of turn.";
const TRAPS_TEXT = "Set Off Traps — This spell deals 5 damage to target attacking creature.";

export default defineCard({
  name: "You Hear Something on Watch",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• ${ROUSE_TEXT}\n• ${TRAPS_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: ROUSE_TEXT,
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 1,
          duration: "end-of-turn",
        },
      },
      {
        text: TRAPS_TEXT,
        targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
        effect: { kind: "damage", amount: 5, target: 0 },
      },
    ],
  },
});
