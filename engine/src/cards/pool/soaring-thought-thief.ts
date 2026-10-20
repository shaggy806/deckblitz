import { defineCard } from "../define.js";

// The anthem reaches every Rogue you control, this one included; the attack
// trigger fires once per attack however many Rogues (Clandestine Meddler's).

const ANTHEM_TEXT = "As long as an opponent has eight or more cards in their graveyard, Rogues you control get +1/+0.";
const ATTACK_TEXT = "Whenever one or more Rogues you control attack, each opponent mills two cards.";

export default defineCard({
  name: "Soaring Thought-Thief",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ANTHEM_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Rogue" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { type: "creature", subtype: "Rogue" } },
      targets: [],
      effect: { kind: "mill", target: "each-opponent", amount: 2 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
