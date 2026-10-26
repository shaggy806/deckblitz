import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 27681.

export default defineCard({
  name: "Gallowbraid",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nCumulative upkeep—Pay 1 life. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
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
                  payLife: 1,
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay 1 life for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: "Cumulative upkeep—Pay 1 life (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
  ],
});
