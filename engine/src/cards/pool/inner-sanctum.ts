import { defineCard } from "../define.js";

// EDHREC rank 23839. Cumulative upkeep in its life form (Decomposition's
// shape); the prevention is Mark of Asylum's, combat damage included.

const PREVENT_TEXT = "Prevent all damage that would be dealt to creatures you control.";

export default defineCard({
  name: "Inner Sanctum",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `Cumulative upkeep—Pay 2 life. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${PREVENT_TEXT}`,
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
                  payLife: 2,
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay 2 life for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: "Cumulative upkeep—Pay 2 life (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        toFilter: { type: "creature", controlledBy: "you" },
      },
      text: PREVENT_TEXT,
    },
  ],
});
