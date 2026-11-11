import { defineCard } from "../define.js";

// Countered this way, the card goes to exile, and its permission there
// (`while-exiled`, free) ends with any move of the card (rule 400.7).
export default defineCard({
  name: "Kheru Spellsnatcher",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 3,
  toughness: 3,
  morph: { keyword: "morph", cost: "{4}{U}{U}" },
  text:
    "Morph {4}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n" +
    "When this creature is turned face up, counter target spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard. You may cast that card without paying its mana cost for as long as it remains exiled.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["spell"],
      effect: {
        kind: "counter",
        target: 0,
        into: "exile",
        ifCountered: { kind: "grant-play", cards: 0, free: true, duration: "while-exiled" },
      },
      resolve: null,
      text: "When this creature is turned face up, counter target spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard. You may cast that card without paying its mana cost for as long as it remains exiled.",
    },
  ],
});
