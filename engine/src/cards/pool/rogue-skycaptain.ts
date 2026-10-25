import { defineCard } from "../define.js";

// Alliances. EDHREC rank 27770.
//
// Rulings:
//   [2008-10-01] If you can't pay the entire payment, none of it is paid.
//   [2008-10-01] No choices are made when this ability triggers. After the wage counter is put on
//     Rogue Skycaptain, then you choose whether to pay mana and, if you don't, which opponent
//     gains control of it.
//
// Cumulative upkeep's shape (Arnjlot's Ascent) with wage counters: the whole
// {2}-per-counter payment or none of it, then — if you don't — the counters
// come off and the opponent you choose as it resolves (Akroan Horse's
// `choose-opponent`) gains control of it for good.

const TEXT =
  "At the beginning of your upkeep, put a wage counter on this creature. You may pay {2} for each wage counter on it. If you don't, remove all wage counters from this creature and an opponent gains control of it.";

export default defineCard({
  name: "Rogue Skycaptain",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Mercenary"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
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
            { kind: "add-counter", target: "source", counter: "wage", amount: 1 },
            {
              kind: "unless",
              chooser: "you",
              options: [
                {
                  pay: "{2}",
                  times: { countersOn: "source", counter: "wage" },
                  text: "Pay {2} for each wage counter",
                },
              ],
              otherwise: {
                kind: "sequence",
                effects: [
                  {
                    kind: "remove-counter",
                    target: "source",
                    counter: "wage",
                    amount: { countersOn: "source", counter: "wage" },
                  },
                  {
                    kind: "choose-opponent",
                    then: { kind: "gain-control", target: "source", who: "that-player", untilEndOfTurn: false },
                  },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
