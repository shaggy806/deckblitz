import { defineCard } from "../define.js";

// EDHREC rank 19922.

export default defineCard({
  name: "Atmosphere Surgeon",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 2,
  toughness: 1,
  text: "Whenever you cast a noncreature spell, put an oil counter on this creature.\nRemove an oil counter from this creature: Target creature gains flying until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "oil", count: 1 } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Remove an oil counter from this creature: Target creature gains flying until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: "Whenever you cast a noncreature spell, put an oil counter on this creature.",
    },
  ],
});
