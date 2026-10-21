import { defineCard } from "../define.js";

// EDHREC rank 16323. Throne of Eldraine.
//
// Ingenious Smith's look-at-four, widened to an artifact or enchantment card.

const ETB_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal an artifact or enchantment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Arcanist's Owl",
  manaCost: "{W/U}{W/U}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["artifact", "enchantment"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
