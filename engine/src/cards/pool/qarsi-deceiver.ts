import { defineCard } from "../define.js";

// A face-down spell is cast by morph, megamorph or disguise (rule 708.4), and
// is always a 2/2 creature spell (708.2a), so "a face-down creature spell" is
// every one of them. A morph cost includes a megamorph cost (702.37b) but not
// a disguise cost; "a manifested creature" is a manifested permanent turned up
// for its mana cost (701.40b), not a cloaked one (701.58b). It can't pay for a
// spell that manifests (the ruling): that spell isn't face down.

const MANA_TEXT =
  "{T}: Add {C}. Spend this mana only to cast a face-down creature spell, pay a mana cost to turn a manifested creature face up, or pay a morph cost. (A megamorph cost is a morph cost.)";

export default defineCard({
  name: "Qarsi Deceiver",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 0,
  toughness: 4,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: {
          purposes: ["face-down-spell", "manifested-face-up", "morph-cost"],
          text: "Spend this mana only to cast a face-down creature spell, pay a mana cost to turn a manifested creature face up, or pay a morph cost.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
