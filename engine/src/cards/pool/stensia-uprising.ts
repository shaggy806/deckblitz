import { defineCard } from "../define.js";

// EDHREC rank 18254. "Exactly thirteen permanents" counts this enchantment
// and the Human just made, as the trigger resolves. "When you do" is a
// reflexive trigger (rule 603.12) that triggers only if it was sacrificed
// (`sacrifice-source`'s `then`), its target chosen then; it deals the damage
// as this enchantment last existed (rule 608.2h).
const TEXT =
  "At the beginning of your end step, create a 1/1 red Human creature token. Then if you control exactly thirteen permanents, you may sacrifice this enchantment. When you do, it deals 7 damage to any target.";

export default defineCard({
  name: "Stensia Uprising",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Red Human Token", count: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "controls", filter: { controlledBy: "you" }, atLeast: 13 },
                { kind: "not", of: { kind: "controls", filter: { controlledBy: "you" }, atLeast: 14 } },
              ],
            },
            then: {
              kind: "may",
              prompt: "Sacrifice Stensia Uprising to have it deal 7 damage to any target?",
              effect: {
                kind: "sacrifice-source",
                then: {
                  kind: "reflexive-trigger",
                  targets: ["any-target"],
                  effect: { kind: "damage", amount: 7, target: 0 },
                  text: "When you do, it deals 7 damage to any target.",
                },
              },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
