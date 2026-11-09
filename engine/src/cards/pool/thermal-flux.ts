import { defineCard } from "../define.js";

const FLUX = "Target nonsnow permanent becomes snow until end of turn.";
const COOL = "Target snow permanent isn't snow until end of turn.";
const DRAW = "Draw a card at the beginning of the next turn's upkeep.";

export default defineCard({
  name: "Thermal Flux",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${FLUX}\n• ${COOL}\n${DRAW}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: FLUX,
        targets: [{ kind: "permanent", filter: { notSupertype: "snow" } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "become", target: 0, addSupertypes: ["snow"], duration: "end-of-turn" },
            { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: DRAW },
          ],
        },
      },
      {
        text: COOL,
        targets: [{ kind: "permanent", filter: { supertype: "snow" } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "become", target: 0, removeSupertypes: ["snow"], duration: "end-of-turn" },
            { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: DRAW },
          ],
        },
      },
    ],
  },
});
