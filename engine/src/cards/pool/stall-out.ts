import { defineCard } from "../define.js";

export default defineCard({
  name: "Stall Out",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Tap target creature or Vehicle, then put three stun counters on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 3 },
    ],
  },
});
