import { defineCard } from "../define.js";

const VILLAIN_TEXT =
  "Whenever a Villain you control enters, each opponent loses 1 life and you gain 1 life. Put a plan counter on this enchantment.";
const PLAN_TEXT =
  "When the fifth plan counter is put on this enchantment, sacrifice it. When you do, target opponent exiles the top five cards of their library. You may cast up to two spells from among the exiled cards without paying their mana costs.";

export default defineCard({
  name: "Doom Reigns Supreme",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${VILLAIN_TEXT}\n${PLAN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Villain" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: VILLAIN_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 5 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          {
            kind: "reflexive-trigger",
            targets: ["opponent"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "exile-from-library", whose: 0, amount: 5 },
                { kind: "cast-now", from: "exiled-this-way", repeat: true, upTo: 2, free: true },
              ],
            },
            text: "When you do, target opponent exiles the top five cards of their library. You may cast up to two spells from among the exiled cards without paying their mana costs.",
          },
        ],
      },
      resolve: null,
      text: PLAN_TEXT,
    },
  ],
});
