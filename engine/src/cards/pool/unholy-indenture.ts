import { defineCard } from "../define.js";

// EDHREC rank 11244.
//
// Minion's Return's shape, with the counter: "that card" comes back only if
// it's still the card that died — a token never does (rule 400.7, the ruling).
//
// Rulings:
//   [2019-07-12] If Unholy Indenture enchants a token, it won't be returned to the battlefield
//     when it dies.
//   [2019-07-12] You control the returned creature, regardless of who controlled it before it
//     died.

const TEXT = "When enchanted creature dies, return that card to the battlefield under your control with a +1/+1 counter on it.";

export default defineCard({
  name: "Unholy Indenture",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        underYourControl: true,
        withCounters: { kind: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
