import { defineCard } from "../define.js";

// EDHREC rank 20031.
//
// Rulings:
//   [2026-06-29] Once a spell or ability that causes you to recruit begins to resolve, no player
//     may take any other actions until it's done. Any responses made to the spell or ability must
//     be made before you draw, discard, and potentially create a token.
//   [2026-06-29] The ability that defines Esgaroth Garrison's power works in all zones, not just
//     the battlefield. As long as Esgaroth Garrison is on the battlefield (and still a creature),
//     that ability will count Esgaroth Garrison itself.
//
// The power is Adeline, Resplendent Cathar's characteristic-defining ability.
// Recruit is The Queen of Dale's draw, discard, then a token if the card
// discarded was nonland.

const POWER_TEXT = "Esgaroth Garrison's power is equal to the number of creatures you control.";
const ENTER_TEXT = "When this creature enters, recruit.";

export default defineCard({
  name: "Esgaroth Garrison",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 0,
  toughness: 5,
  text: `${POWER_TEXT}\n${ENTER_TEXT} (Draw a card, then discard a card. If you discarded a nonland card, create a 1/1 white Human Soldier creature token.)`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
            then: { kind: "create-token", token: "Human Soldier Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
