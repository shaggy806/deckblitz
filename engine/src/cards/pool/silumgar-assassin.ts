import { defineCard } from "../define.js";

// EDHREC rank 11344.
//
// Rulings:
//   [2015-02-25] If a face-down creature with megamorph is turned face up some other way (for
//     example, if you manifest a card with megamorph and then pay its mana cost to turn it face
//     up), you won’t put a +1/+1 counter on it.
//   [2015-02-25] The powers of Silumgar Assassin and the creature trying to block it are checked
//     only as blockers are declared. Changing the powers of either of those creatures after
//     Silumgar Assassin is legally blocked won’t change or undo the block.

const EVASION_TEXT = "Creatures with power greater than this creature's power can't block it.";
const UP_TEXT = "When this creature is turned face up, destroy target creature with power 3 or less an opponent controls.";

export default defineCard({
  name: "Silumgar Assassin",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 1,
  morph: { keyword: "megamorph", cost: "{2}{B}" },
  text: `${EVASION_TEXT}\nMegamorph {2}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\n${UP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
