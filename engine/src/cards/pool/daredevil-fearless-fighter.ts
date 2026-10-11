import { defineCard } from "../define.js";

// EDHREC rank 16327.
//
// The first trigger fires once per damage event a source you control deals
// you, "that much" the damage dealt after prevention — Daredevil's own
// attack trigger included. The second is Tavern Brawler's impulse exile
// read by mana value: the damage is the exiled card's mana value (0 for a
// land, and none at all with an empty library).

const REFLECT_TEXT =
  "Whenever a source you control deals damage to you, Daredevil deals that much damage to target opponent.";
const ATTACK_TEXT =
  "Whenever Daredevil attacks, exile the top card of your library. Daredevil deals damage to you equal to that card's mana value. You may play it this turn.";

export default defineCard({
  name: "Daredevil, Fearless Fighter",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 3,
  text: `${REFLECT_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "you" },
      targets: ["opponent"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: REFLECT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
          { kind: "damage", amount: { thisWay: "exiled", sumOf: "mana-value" }, who: "you" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
