import { defineCard } from "../define.js";

const HUMAN_TEXT = "Target Human creature you control gets +1/+1 and gains indestructible until end of turn.";
const NON_HUMAN_TEXT = "Target non-Human creature you control gets +1/+1 and gains indestructible until end of turn.";

const pump = {
  kind: "sequence",
  effects: [
    { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
    { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
  ],
} as const;

export default defineCard({
  name: "Fight as One",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one or both —\n• ${HUMAN_TEXT}\n• ${NON_HUMAN_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: HUMAN_TEXT,
        targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Human" } }],
        effect: pump,
      },
      {
        text: NON_HUMAN_TEXT,
        targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notSubtypes: ["Human"] } }],
        effect: pump,
      },
    ],
  },
});
