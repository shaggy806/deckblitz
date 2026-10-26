import { defineCard } from "../define.js";

// EDHREC rank 22675.

const DEALT_TEXT = "Whenever this creature is dealt damage, discard that many cards.";
const HELLBENT_TEXT =
  "Hellbent — Whenever this creature deals combat damage to a player, if you have no cards in hand, that player discards cards equal to the damage.";

export default defineCard({
  name: "Jagged Poppet",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 4,
  text: `${DEALT_TEXT}\n${HELLBENT_TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "you", amount: { triggerValue: true } },
      resolve: null,
      text: DEALT_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: { triggerValue: true } },
      resolve: null,
      text: HELLBENT_TEXT,
    },
  ],
});
