import { defineCard } from "../define.js";

// EDHREC rank 31418. Shadowmoor.
//
// Rulings:
//   [2008-05-01] An object that’s both of the listed colors will cause both abilities to trigger.
//     You can put them on the stack in either order.

const GREEN_TEXT = "Whenever you cast a green spell, this creature gets +1/+1 until end of turn.";
const WHITE_TEXT = "Whenever you cast a white spell, this creature gains vigilance until end of turn.";

export default defineCard({
  name: "Safehold Duo",
  manaCost: "{3}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior", "Shaman"],
  power: 2,
  toughness: 4,
  text: `${GREEN_TEXT}\n${WHITE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: GREEN_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
      resolve: null,
      text: WHITE_TEXT,
    },
  ],
});
