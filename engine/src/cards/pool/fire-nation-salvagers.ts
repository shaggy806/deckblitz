import { defineCard } from "../define.js";

// EDHREC rank 17789. Once for each player dealt combat damage by creatures you
// control that had counters on them as the damage was dealt (the ruling), the
// target from that player's graveyard.
//
// Rulings:
//   The last ability will trigger once for each player dealt damage by creatures you control. If
//     you deal damage to two opponents, you will be able to target a creature or Vehicle card from
//     each of their graveyards.
const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature or Vehicle you control.";
const DAMAGE_TEXT =
  "Whenever one or more creatures you control with counters on them deal combat damage to a player, put target creature or Vehicle card from that player's graveyard onto the battlefield under your control.";

export default defineCard({
  name: "Fire Nation Salvagers",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${ENTER_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
        to: "player",
        combat: true,
        once: "per-player",
      },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "trigger-player",
          filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
