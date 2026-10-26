import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] The ability checks whether Sphinx Sovereign is tapped or untapped at the time the
//     ability resolves. If Sphinx Sovereign is no longer on the battlefield by then, the ability
//     checks whether Sphinx Sovereign was tapped or untapped at the time it left the battlefield.
//     (A `source` condition reads the source's stint as it last existed once it has left.)

const END_TEXT =
  "At the beginning of your end step, you gain 3 life if this creature is untapped. Otherwise, each opponent loses 3 life.";

export default defineCard({
  name: "Sphinx Sovereign",
  manaCost: "{4}{W}{U}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { tapped: false } },
        then: { kind: "gain-life", amount: 3 },
        else: { kind: "lose-life", amount: 3, who: "each-opponent" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
