import { defineCard } from "../define.js";

// EDHREC rank 9732.
//
// The emblem's ability is activated from the command zone (rule 114.4), by
// the player who has the emblem. X is the sacrificed creature's power as it
// last existed on the battlefield (rule 608.2h), as Disciple of Bolas reads it.

const PLUS_TEXT = "+2: Each opponent loses 1 life. You gain life equal to the life lost this way.";
const MINUS_TEXT = "−2: Create a 5/5 black Demon creature token with flying. You lose 2 life.";
const EMBLEM =
  "{1}{B}, Sacrifice a creature: You gain X life and draw X cards, where X is the sacrificed creature's power.";
const ULT_TEXT = `−8: You get an emblem with "${EMBLEM}"`;
const COMMANDER_TEXT = "Ob Nixilis of the Black Oath can be your commander.";

export default defineCard({
  name: "Ob Nixilis of the Black Oath",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nixilis"],
  loyalty: 3,
  canBeCommander: true,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}\n${COMMANDER_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "5/5 Demon Token", count: 1 },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        activated: [
          {
            cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
            targets: [],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-life", amount: { powerOf: { paid: "sacrificed" } } },
                { kind: "draw", amount: { powerOf: { paid: "sacrificed" } } },
              ],
            },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
