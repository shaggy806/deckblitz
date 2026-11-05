import { defineCard } from "../define.js";

export default defineCard({
  name: "Invasion of Eldraine",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: "(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)\nWhen this Siege enters, target opponent discards two cards.",
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "defense", last: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "cast-now", from: "source-exiled-this-way", free: true, transformed: true },
        ],
      },
      resolve: null,
      text: "When the last defense counter is removed from this permanent, exile it, then you may cast it transformed without paying its mana cost.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 2 },
      resolve: null,
      text: "When this Siege enters, target opponent discards two cards.",
    },
  ],
  faces: ["Invasion of Eldraine", "Prickle Faeries"],
  transform: true,
});
