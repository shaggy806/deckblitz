import { defineCard } from "../define.js";

const TEXT =
  "Whenever you attack with exactly two creatures, those creatures gain first strike until end of turn, then draw a card. Whenever either of those creatures deals combat damage to a player this combat, put a +1/+1 counter on it.";

export default defineCard({
  name: "Love on the Battlefield",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", exactly: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: { inSet: "trigger-batch" }, keyword: "first-strike", duration: "end-of-turn" },
          { kind: "draw", amount: 1 },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "deals-combat-damage-to-player", who: "any", filter: { inSet: "trigger-batch" } },
              until: "until-end-of-combat",
            },
            effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
            text: "Whenever either of those creatures deals combat damage to a player this combat, put a +1/+1 counter on it.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
