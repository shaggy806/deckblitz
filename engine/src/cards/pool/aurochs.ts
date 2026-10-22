import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 30453.
//
// Rulings:
//   [2004-10-04] The bonus is not applied until after you check for attack legality, so it is a
//     2/3 creature when declaring attackers.
//   [2009-10-01] The ability counts the number of attacking creatures with the creature type
//     Aurochs, not just those named Aurochs.

const TEXT = "Whenever this creature attacks, it gets +1/+0 until end of turn for each other attacking Aurochs.";

export default defineCard({
  name: "Aurochs",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Aurochs"],
  power: 2,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", subtype: "Aurochs", attacking: true }, excludeSelf: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
