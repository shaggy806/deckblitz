import { defineCard } from "../define.js";

// EDHREC rank 17947. Bite Down, then a delayed trigger on the second target:
// it fires if that permanent dies this turn for any reason, not only from
// this damage (the ruling).
const DIES_TEXT = "When the permanent you don't control dies this turn, you gain 2 life.";

export default defineCard({
  name: "Devouring Tendrils",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Target creature you control deals damage equal to its power to target creature or planeswalker you don't control. ${DIES_TEXT}`,
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "fight", a: 0, b: 1, oneSided: true },
      {
        kind: "delayed-trigger",
        at: { leaves: 1, to: ["graveyard"], thisTurn: true },
        effect: { kind: "gain-life", amount: 2 },
        text: DIES_TEXT,
      },
    ],
  },
});
