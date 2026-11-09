import { defineCard } from "../define.js";

const TEXT = "When this creature is turned face up, turn any number of target creatures with morph abilities other than this creature face down.";

export default defineCard({
  name: "Weaver of Lies",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  morph: { keyword: "morph", cost: "{4}{U}" },
  text: `Morph {4}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "other", of: { kind: "permanent", filter: { type: "creature", hasKeyword: "morph" } } },
        },
      ],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "turn-face-down", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
