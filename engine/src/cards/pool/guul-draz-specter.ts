import { defineCard } from "../define.js";

const PUMP_TEXT = "This creature gets +3/+3 as long as an opponent has no cards in hand.";
const DISCARD_TEXT = "Whenever this creature deals combat damage to a player, that player discards a card.";

export default defineCard({
  name: "Guul Draz Specter",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}\n${DISCARD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "of-player", player: "an-opponent", condition: { kind: "hand-size", atMost: 0 } },
      grantPt: [3, 3],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "as-player", who: "trigger-player", effect: { kind: "discard", target: "you", amount: 1 } },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
