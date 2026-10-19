import { defineCard } from "../define.js";

// The Brothers' War.
export default defineCard({
  name: "Gix's Caress",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.\n" +
    'Create a tapped Powerstone token. (It\'s an artifact with "{T}: Add {C}. This mana can\'t be spent to cast ' +
    'a nonartifact spell.")',
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
    ],
  },
});
