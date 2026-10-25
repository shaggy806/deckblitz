import { defineCard } from "../define.js";

const ANTHEM_TEXT = "Other colorless creatures you control get +1/+0.";

export default defineCard({
  name: "Ruination Guide",
  manaCost: "{2}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 2,
  text: `Devoid (This card has no color.)\nIngest (Whenever this creature deals combat damage to a player, that player exiles the top card of their library.)\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1 },
      resolve: null,
      text: "Ingest",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colorless: true, controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
});
