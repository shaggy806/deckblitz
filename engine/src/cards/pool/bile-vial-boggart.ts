import { defineCard } from "../define.js";

// EDHREC rank 13037.

export default defineCard({
  name: "Bile-Vial Boggart",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Assassin"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, put a -1/-1 counter on up to one target creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "When this creature dies, put a -1/-1 counter on up to one target creature.",
    },
  ],
});
