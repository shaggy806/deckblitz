import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 12390. A Clue Equipment: "a Clue" counts it (the rulings), and
// its own sacrifice-to-draw is the Clue ability.
const GRANTED = "Whenever this creature attacks, surveil 2.";
const STATIC = `Equipped creature gets +1/+1 and has "${GRANTED}"`;
const DRAW = "{2}, Sacrifice this Equipment: Draw a card.";

export default defineCard({
  name: "Candlestick",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Clue", "Equipment"],
  text: `${STATIC} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\n${DRAW}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "surveil", amount: 2 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
    equip("{2}"),
  ],
});
