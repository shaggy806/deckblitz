import { defineCard } from "../define.js";

const ANTHEM_TEXT = "Equipped creatures you control get +1/+1.";
const DIES_TEXT = "Whenever an equipped creature you control dies, draw a card.";

export default defineCard({
  name: "Stone Haven Outfitter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Artificer", "Ally"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", equipped: true } },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", equipped: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
