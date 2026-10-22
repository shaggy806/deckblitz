import { defineCard } from "../define.js";

// EDHREC rank 21811. Fallen Empires.
//
// Rulings:
//   [2004-10-04] You can use this ability multiple times on one spell to force your opponent to
//     use more than one mana to prevent the spell from being countered.

const TEXT = "{1}{B}: Counter target black spell unless that spell's controller pays {B} or {3}.";

export default defineCard({
  name: "Thrull Wizard",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "spell", filter: { colors: ["B"] } }],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [
          { pay: "{B}", text: "Pay {B}" },
          { pay: "{3}", text: "Pay {3}" },
        ],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
