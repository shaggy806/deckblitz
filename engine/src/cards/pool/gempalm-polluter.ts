import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 8405.
//
// The cycle trigger is its own ability: it resolves before the cycling draw,
// and the card can be cycled with no legal target for it (rulings).

export default defineCard({
  name: "Gempalm Polluter",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 3,
  cycling: { cost: "{B}{B}" },
  text: "Cycling {B}{B} ({B}{B}, Discard this card: Draw a card.)\nWhen you cycle this card, you may have target player lose life equal to the number of Zombies on the battlefield.",
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have the target player lose life equal to the number of Zombies on the battlefield?",
        effect: { kind: "lose-life", target: 0, amount: { countOf: { subtype: "Zombie" } } },
      },
      resolve: null,
      text: "When you cycle this card, you may have target player lose life equal to the number of Zombies on the battlefield.",
    },
  ],
});
