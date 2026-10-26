import { defineCard } from "../define.js";

// EDHREC rank 30281. Shadowmoor.
//
// Rulings:
//   [2008-05-01] An object that’s both of the listed colors will cause both abilities to trigger.
//     You can put them on the stack in either order.

const BLACK_TEXT = "Whenever you cast a black spell, this creature gets +1/+1 until end of turn.";
const RED_TEXT = "Whenever you cast a red spell, this creature gains first strike until end of turn.";

export default defineCard({
  name: "Emberstrike Duo",
  manaCost: "{1}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior", "Shaman"],
  power: 1,
  toughness: 1,
  text: `${BLACK_TEXT}\n${RED_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: BLACK_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: RED_TEXT,
    },
  ],
});
