import { defineCard } from "../define.js";

// EDHREC rank 16143.


const DAMAGE_TEXT =
  "Whenever Venus is dealt damage, put that many +1/+1 counters on her. (She must survive the damage to get the counters.)";
const DRAW_TEXT =
  "Whenever a creature you control with a counter on it deals combat damage to a player, you may pay {U}. If you do, draw a card.";

// Strength of Will's trigger (dead, she gets nothing), and Ray Fillet's
// "with a counter on it" — any kind — with Dawn of Hope's optional payment.
export default defineCard({
  name: "Venus, Torn Between Worlds",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Frog", "Turtle"],
  power: 5,
  toughness: 5,
  text: `${DAMAGE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "may", prompt: "Pay {U} to draw a card?", cost: "{U}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
