import { defineCard } from "../define.js";

// EDHREC rank 15311.
export default defineCard({
  name: "Aggressive Negotiations",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it and exile that card. Put a +1/+1 counter on up to one target creature you control.",
  targets: ["opponent", { kind: "optional", of: "creature-you-control" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
