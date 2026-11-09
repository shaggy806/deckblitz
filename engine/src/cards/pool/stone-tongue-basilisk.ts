import { defineCard } from "../define.js";

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a creature, destroy that creature at end of combat.";
const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, all creatures able to block this creature do so.";

export default defineCard({
  name: "Stone-Tongue Basilisk",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Basilisk"],
  power: 4,
  toughness: 5,
  text: `${DAMAGE_TEXT}\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end-combat" },
        effect: { kind: "destroy", target: "trigger-recipient" },
        text: "Destroy that creature.",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      restrictions: ["must-be-blocked"],
      text: THRESHOLD_TEXT,
    },
  ],
});
