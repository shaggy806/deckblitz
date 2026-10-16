import { defineCard } from "../define.js";

// EDHREC rank 17394. Phantasmal Image's becomes-target sacrifice, which
// resolves before the spell or ability that targeted it (the ruling); dying
// then draws a card.

export default defineCard({
  name: "Phantasmal Shieldback",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Turtle", "Illusion"],
  power: 1,
  toughness: 3,
  text: "When this creature becomes the target of a spell or ability, sacrifice it.\nWhen this creature dies, draw a card.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When this creature becomes the target of a spell or ability, sacrifice it.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature dies, draw a card.",
    },
  ],
});
