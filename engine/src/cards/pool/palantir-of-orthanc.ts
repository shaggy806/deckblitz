import { defineCard } from "../define.js";

// EDHREC rank 1339. Combustible Gearhulk's question: the target opponent
// answers as the ability resolves, after the counter and the scry, and each
// outcome is Palantír's controller's effect. X is read after the counter went
// on; the life is the milled cards' total mana value (rule 701.17c).
const TEXT =
  "At the beginning of your end step, put an influence counter on Palantír of Orthanc and scry 2. Then target opponent may have you draw a card. If that player doesn't, you mill X cards, where X is the number of influence counters on Palantír of Orthanc, and that player loses life equal to the total mana value of those cards.";

export default defineCard({
  name: "Palantír of Orthanc",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "influence", amount: 1 },
          { kind: "scry", amount: 2 },
          {
            kind: "each-player-may",
            who: { controllerOfTarget: 0 },
            choices: [
              { text: "Have them draw a card.", effect: { kind: "draw", amount: 1 } },
              {
                text: "They mill X cards, where X is the number of influence counters on Palantír of Orthanc, and you lose life equal to the total mana value of those cards.",
                effect: {
                  kind: "sequence",
                  effects: [
                    { kind: "mill", target: "you", amount: { countersOn: "source", counter: "influence" } },
                    { kind: "lose-life", target: 0, amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "milled" } } },
                  ],
                },
              },
            ],
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
