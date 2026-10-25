import { defineCard } from "../define.js";

// EDHREC rank 22412.
//
// Rulings:
//   [2015-02-25] If a face-down creature with megamorph is turned face up some other way (for
//     example, if you manifest a card with megamorph and then pay its mana cost to turn it face
//     up), you won't put a +1/+1 counter on it.

const UP_TEXT = "When this creature is turned face up, put a +1/+1 counter on each other Dragon creature you control.";

export default defineCard({
  name: "Herdchaser Dragon",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "trample"],
  morph: { keyword: "megamorph", cost: "{5}{G}{G}" },
  text: `Flying, trample\nMegamorph {5}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", subtype: "Dragon", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
