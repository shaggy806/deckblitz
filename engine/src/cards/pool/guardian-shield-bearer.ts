import { defineCard } from "../define.js";

// EDHREC rank 27192.
//
// Rulings:
//   [2015-02-25] If a face-down creature with megamorph is turned face up some other way (for
//     example, if you manifest a card with megamorph and then pay its mana cost to turn it face
//     up), you won't put a +1/+1 counter on it.

const UP_TEXT = "When this creature is turned face up, put a +1/+1 counter on another target creature you control.";

export default defineCard({
  name: "Guardian Shield-Bearer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  morph: { keyword: "megamorph", cost: "{3}{G}" },
  text: `Megamorph {3}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature" } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
