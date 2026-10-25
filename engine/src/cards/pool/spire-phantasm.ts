import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32084.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// The enters trigger's "if you guessed correctly" is never true, so it never triggers
// (rule 603.4).
export default defineCard({
  name: "Spire Phantasm",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Gargoyle", "Illusion"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Reveal this card as you draft it. The next time a player drafts a card from this booster pack, guess that card's name. Then that player reveals the drafted card.\nFlying\nWhen this creature enters, if you guessed correctly for a card named Spire Phantasm, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, if you guessed correctly for a card named Spire Phantasm, draw a card.",
        },
  ],
});
