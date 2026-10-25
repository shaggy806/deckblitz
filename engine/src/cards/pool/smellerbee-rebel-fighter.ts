import { defineCard } from "../define.js";

// EDHREC rank 8075.
// "Discard your hand. If you do" is Narset, Jeskai Waymaster's shape. The
// attacking creatures are counted as the trigger resolves.

const HASTE_TEXT = "Other creatures you control have haste.";
const ATTACK_TEXT =
  "Whenever Smellerbee attacks, you may discard your hand. If you do, draw cards equal to the number of attacking creatures.";

export default defineCard({
  name: "Smellerbee, Rebel Fighter",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${HASTE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw a card for each attacking creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "draw", amount: { countOf: { type: "creature", attacking: true } } },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
});
