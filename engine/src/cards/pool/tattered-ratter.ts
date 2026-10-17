import { defineCard } from "../define.js";

// EDHREC rank 21629.
//
// "It" is the Rat that became blocked — the trigger object (Grazilaxx's
// shape) — once per Rat, however many creatures block it.

const TEXT = "Whenever a Rat you control becomes blocked, it gets +2/+0 until end of turn.";

export default defineCard({
  name: "Tattered Ratter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { subtype: "Rat" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
