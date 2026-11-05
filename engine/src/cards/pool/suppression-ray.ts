import { defineCard } from "../define.js";

// EDHREC rank 7533. "Creatures tapped this way": not those already tapped (the
// ruling), so `thisWay: "tapped"`.
export default defineCard({
  name: "Suppression Ray",
  manaCost: "{3}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  faces: ["Suppression Ray", "Orderly Plaza"],
  text: "Tap all creatures target player controls. You may pay any amount of {E}. If you do, choose up to that many creatures tapped this way. Put a stun counter on each of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      {
        kind: "may",
        prompt: "Pay any amount of {E} to put stun counters on up to that many creatures tapped this way?",
        costEnergyX: "any",
        effect: {
          kind: "choose-permanents",
          filter: { thisWay: "tapped" },
          min: 0,
          upTo: "x",
          prompt: "Choose creatures tapped this way to put a stun counter on",
          then: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        },
      },
    ],
  },
});
