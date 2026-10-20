import { defineCard } from "../define.js";

// EDHREC rank 15476. United Battlefront's look-and-choose; "permanent card"
// is every permanent card type, lands (mana value 0) included.

export default defineCard({
  name: "Storm the Festival",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{7}{G}{G}{G}" },
  text: "Look at the top five cards of your library. You may put up to two permanent cards with mana value 5 or less from among them onto the battlefield. Put the rest on the bottom of your library in a random order.\nFlashback {7}{G}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    min: 0,
    max: 2,
    filter: {
      typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
      manaValue: { op: "lte", n: 5 },
    },
    destination: "battlefield",
    leftover: "bottom-random",
  },
});
