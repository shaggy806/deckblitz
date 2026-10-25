import { defineCard } from "../define.js";

// The life loss doesn't wait on a discard (the ruling): it only asks whether
// you control a Warrior as it resolves.

export default defineCard({
  name: "Diplomacy of the Wastes",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. If you control a Warrior, that player loses 2 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Warrior" }, atLeast: 1 },
        then: { kind: "lose-life", amount: 2, target: 0 },
      },
    ],
  },
});
