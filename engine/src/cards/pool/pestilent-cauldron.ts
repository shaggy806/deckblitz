import { defineCard } from "../define.js";

const PEST_TEXT =
  "{T}, Discard a card: Create a 1/1 black and green Pest creature token with \"When this token dies, you gain 1 life.\"";
const MILL_TEXT = "{1}, {T}: Each opponent mills cards equal to the amount of life you gained this turn.";
const EXILE_TEXT = "{4}, {T}: Exile four target cards from a single graveyard. Draw a card.";

export default defineCard({
  name: "Pestilent Cauldron",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${PEST_TEXT}\n${MILL_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Pest Token", count: 1 },
      resolve: null,
      text: PEST_TEXT,
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      // Life gained, whatever was lost beside it (the ruling).
      effect: { kind: "mill", target: "each-opponent", amount: { turnStat: "life-gained", who: "you" } },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "any" },
          min: 4,
          max: 4,
          sameController: true,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  faces: ["Pestilent Cauldron", "Restorative Burst"],
});
