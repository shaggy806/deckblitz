import { defineCard } from "../define.js";

const GRANTED_TEXT = "When this creature enters, it deals 3 damage to any target.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Pardic Arsonist",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 3,
  toughness: 3,
  text: THRESHOLD_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 3, target: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
