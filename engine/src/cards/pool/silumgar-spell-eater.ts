import { defineCard } from "../define.js";

// EDHREC rank 22974.
//
// Rulings:
//   [2015-02-25] If a face-down creature with megamorph is turned face up some other way (for
//     example, if you manifest a card with megamorph and then pay its mana cost to turn it face
//     up), you won't put a +1/+1 counter on it.

const UP_TEXT = "When this creature is turned face up, counter target spell unless its controller pays {3}.";

export default defineCard({
  name: "Silumgar Spell-Eater",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 2,
  toughness: 3,
  morph: { keyword: "megamorph", cost: "{4}{U}" },
  text: `Megamorph {4}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["spell"],
      effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
