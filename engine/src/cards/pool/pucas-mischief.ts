import { defineCard } from "../define.js";

// EDHREC rank 9475.
//
// Rulings:
//   You must choose two legal targets if you can, even if you don't plan on
//     exchanging; if you can't, you choose none.
//   If either target is illegal as it resolves, the exchange doesn't happen.
//   The targets are chosen as a set: a permanent of yours with a lower mana
//     value than every opponent's nonland permanent can't be the first.
//
// The second slot's mana value is at most the first's (`compares`), checked
// as the targets are chosen, the pair together (rule 601.2c), and again as it
// resolves (608.2b).
const TEXT =
  "At the beginning of your upkeep, you may exchange control of target nonland permanent you control and target nonland permanent an opponent controls with equal or lesser mana value.";

export default defineCard({
  name: "Puca's Mischief",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [
        { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } },
        {
          kind: "other",
          of: { kind: "permanent", whose: "opponent", filter: { notTypes: ["land"] } },
          than: { slot: 0 },
          compares: { stat: "mana-value", op: "lte" },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exchange control of the two target permanents?",
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
