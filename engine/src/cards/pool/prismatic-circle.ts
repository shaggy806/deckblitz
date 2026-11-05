import { defineCard } from "../define.js";

// EDHREC rank 30411.

export default defineCard({
  name: "Prismatic Circle",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  text: "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nAs this enchantment enters, choose a color.\n{1}: The next time a source of your choice of the chosen color would deal damage to you this turn, prevent that damage.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { ofChosenColor: true },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: "{1}: The next time a source of your choice of the chosen color would deal damage to you this turn, prevent that damage.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "age", amount: 1 },
            {
              kind: "unless",
              chooser: "you",
              options: [
                {
                  pay: "{1}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {1} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
  ],
});
