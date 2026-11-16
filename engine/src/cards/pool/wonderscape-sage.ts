import { NONBASIC_LAND_TYPES } from "../../subtypes.js";
import { defineCard } from "../define.js";

// EDHREC rank 11070. "That land" is the one the cost returned, read as it last
// existed on the battlefield (rule 608.2h; the rulings): its land types then,
// a Copy Land's copied ones or an Omo everything counter's every type, not
// whether it was nonbasic.

const LOOT_TEXT =
  "{T}, Return a land you control to its owner's hand: Draw a card. Then discard a card unless that land had a nonbasic land type.";

export default defineCard({
  name: "Wonderscape Sage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "not",
              of: { kind: "object-matches", object: { paid: "returned" }, filter: { subtypes: NONBASIC_LAND_TYPES } },
            },
            then: { kind: "discard", target: "you", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
