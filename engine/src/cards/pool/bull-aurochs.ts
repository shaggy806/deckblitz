import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 30555. Aurochs's trigger.
//
// Rulings:
//   [2006-07-15] Abilities of Aurochs care about other creatures that have creature type Aurochs,
//     which includes (but is not limited to) the Ice Age card named Aurochs.

const TEXT = "Whenever this creature attacks, it gets +1/+0 until end of turn for each other attacking Aurochs.";

export default defineCard({
  name: "Bull Aurochs",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Aurochs"],
  power: 2,
  toughness: 1,
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
