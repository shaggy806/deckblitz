import { defineCard } from "../define.js";

// EDHREC rank 22671.
//
// The "if you control another colorless creature" is an intervening-if
// (rule 603.4): checked as it enters and again as it resolves (the ruling).
const INGEST = "Whenever this creature deals combat damage to a player, that player exiles the top card of their library.";
const ETB = "When this creature enters, if you control another colorless creature, each opponent loses 2 life.";

export default defineCard({
  name: "Dominator Drone",
  manaCost: "{2}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 2,
  text: `Devoid (This card has no color.)\nIngest (${INGEST})\n${ETB}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1 },
      resolve: null,
      text: "Ingest",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { type: "creature", colorless: true }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-opponent" },
      resolve: null,
      text: ETB,
    },
  ],
});
