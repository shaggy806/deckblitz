import { defineCard } from "../define.js";

// EDHREC rank 30776.

export default defineCard({
  name: "There's Coffee in that Nebula",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: {
    cost: "{2}{W}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Look at the top five cards of your library. You may reveal a Plains card or nonland permanent card with mana value 3 or less from among them and put it into your hand. Put the rest on the bottom in a random order.\nBeam me up {2}{W} (You may cast this card from your graveyard for {2}{W} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: {
      anyOf: [
        { subtype: "Plains" },
        {
          typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
          notTypes: ["land"],
          manaValue: { op: "lte", n: 3 },
        },
      ],
    },
    destination: "hand",
    leftover: "bottom-random",
  },
});
