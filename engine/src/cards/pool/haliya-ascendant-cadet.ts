import { defineCard } from "../define.js";

// EDHREC rank 9257.
//
// Rulings:
//   [2025-07-25] A creature that deals combat damage to a player must have a +1/+1 counter on it
//     at the time damage is dealt in order for Haliya, Ascendant Cadet’s last ability to trigger.

const COUNTER_TEXT = "Whenever Haliya enters or attacks, put a +1/+1 counter on target creature you control.";
const DRAW_TEXT =
  "Whenever one or more creatures you control with +1/+1 counters on them deal combat damage to a player, draw a card.";

export default defineCard({
  name: "Haliya, Ascendant Cadet",
  manaCost: "{2}{G}{W}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${COUNTER_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      // Once per player dealt damage (Bottomless Pool's batch), the sources
      // matched as the damage is dealt — the ruling's "at the time damage is
      // dealt".
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        combat: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
