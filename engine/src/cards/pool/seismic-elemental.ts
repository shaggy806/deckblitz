import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 27203.
//
// Rulings:
//   [2015-06-22] No creature without flying will be able to block that turn, including creatures
//     that lose flying after the ability resolves and creatures without flying that enter after.
//
// Destructive Tampering's `restrict` by filter: a rule for the rest of the
// turn, so it binds creatures that enter or lose flying later (the ruling).
const ETB_TEXT = "When this creature enters, creatures without flying can't block this turn.";

export default defineCard({
  name: "Seismic Elemental",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "restrict", filter: { type: "creature", notKeyword: "flying" }, restrictions: ["cant-block"] },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
