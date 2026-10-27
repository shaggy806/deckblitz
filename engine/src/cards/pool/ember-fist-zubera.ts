import { defineCard } from "../define.js";

export default defineCard({
  name: "Ember-Fist Zubera",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zubera", "Spirit"],
  power: 1,
  toughness: 2,
  text: "When this creature dies, it deals damage to any target equal to the number of Zubera that died this turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { turnHistory: "died", who: "each-player", filter: { subtype: "Zubera" } } },
      resolve: null,
      text: "When this creature dies, it deals damage to any target equal to the number of Zubera that died this turn.",
    },
  ],
});
