import { defineCard } from "../define.js";

// EDHREC rank 22488.
//
// Rulings:
//   [2006-02-01] A spell you cast that's blue and red will trigger both abilities. You can put
//     them on the stack in either order.
const BLUE_TEXT = "Whenever you cast a blue spell, target creature gains flying until end of turn.";
const RED_TEXT = "Whenever you cast a red spell, Tibor and Lumia deals 1 damage to each creature without flying.";

export default defineCard({
  name: "Tibor and Lumia",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${BLUE_TEXT}\n${RED_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: BLUE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      resolve: null,
      text: RED_TEXT,
    },
  ],
});
