import { defineCard } from "../define.js";

// EDHREC rank 25554.
//
// Rulings:
//   [2015-02-25] If a face-down creature with megamorph is turned face up some other way (for
//     example, if you manifest a card with megamorph and then pay its mana cost to turn it face
//     up), you won't put a +1/+1 counter on it.

const UP_TEXT =
  "When this creature is turned face up, return target noncreature, nonland card from your graveyard to your hand.";

export default defineCard({
  name: "Monastery Loremaster",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Wizard"],
  power: 3,
  toughness: 2,
  morph: { keyword: "megamorph", cost: "{5}{U}" },
  text: `Megamorph {5}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["creature", "land"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
