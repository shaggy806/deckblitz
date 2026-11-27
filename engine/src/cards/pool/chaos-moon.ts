import { defineCard } from "../define.js";

// EDHREC rank 23233.
//
// The permanents are counted as the ability resolves; "red creatures get"
// changes only the creatures that are red then (rule 611.2c). The odd half's
// extra {R} is Bubbling Muck's delayed triggered mana ability (rule 605.1b),
// the even half Pale Moon's "produces colorless mana instead" (106.12b).

const TEXT =
  "At the beginning of each upkeep, count the number of permanents. If the number is odd, until end of turn, red creatures get +1/+1 and whenever a player taps a Mountain for mana, that player adds an additional {R}. If the number is even, until end of turn, red creatures get -1/-1 and if a player taps a Mountain for mana, that Mountain produces colorless mana instead of any other type.";

const RED = { type: "creature", colors: ["R"] } as const;

export default defineCard({
  name: "Chaos Moon",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "amount-parity", amount: { countOf: {} }, parity: "odd" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt-all", filter: RED, power: 1, toughness: 1, duration: "end-of-turn" },
            {
              kind: "delayed-trigger",
              at: { whenever: { on: "tapped-for-mana", who: "any", filter: { subtype: "Mountain" } } },
              effect: { kind: "add-mana", mana: "R", amount: 1 },
              text: "Whenever a player taps a Mountain for mana, that player adds an additional {R}.",
            },
          ],
        },
        else: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt-all", filter: RED, power: -1, toughness: -1, duration: "end-of-turn" },
            {
              kind: "player-effect",
              duration: "end-of-turn",
              manaProduction: { filter: { subtype: "Mountain" }, produces: "C", tapper: "any" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
