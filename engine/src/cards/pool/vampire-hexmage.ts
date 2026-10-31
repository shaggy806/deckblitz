import { defineCard } from "../define.js";

// Every counter of every kind (`counter: "any"`, `amount: "all"`): a
// planeswalker's loyalty (it dies to the state-based action, rule 704.5i),
// Dark Depths' ice, a creature's +1/+1 or -1/-1 counters.

const SAC_TEXT = "Sacrifice this creature: Remove all counters from target permanent.";

export default defineCard({
  name: "Vampire Hexmage",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Shaman"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["permanent"],
      effect: { kind: "remove-counter", target: 0, counter: "any", amount: "all" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
