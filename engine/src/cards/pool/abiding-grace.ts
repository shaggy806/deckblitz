import { defineCard } from "../define.js";

// EDHREC rank 8584. Commander 2021.
//
// A modal triggered ability: the mode (and the second mode's target) is
// chosen as it goes on the stack (rule 700.2b — `announced`). "Mana value 1"
// is exactly 1; an {X} in a graveyard card's cost counts 0 (its ruling).
const TEXT =
  "At the beginning of your end step, choose one —\n• You gain 1 life.\n• Return target creature card with mana value 1 from your graveyard to the battlefield.";

export default defineCard({
  name: "Abiding Grace",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { effect: { kind: "gain-life", amount: 1 }, text: "You gain 1 life." },
          {
            text: "Return target creature card with mana value 1 from your graveyard to the battlefield.",
            targets: [
              {
                kind: "card-in-graveyard",
                whose: "you",
                filter: { type: "creature", manaValue: { op: "eq", n: 1 } },
              },
            ],
            effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
