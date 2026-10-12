import { defineCard } from "../define.js";

// EDHREC rank 3937.
//
// Rulings: airbend's — its owner may cast the card from exile for {2} (an
// alternative cost: X is 0, additional costs still paid), a token exiled is
// gone, a land can't be played from there.
const TEXT = "Airbend target nonland permanent.";

export default defineCard({
  name: "Airbending Lesson",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: `${TEXT} (Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)\nDraw a card.`,
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0, airbend: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
