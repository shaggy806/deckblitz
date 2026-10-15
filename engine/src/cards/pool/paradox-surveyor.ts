import { defineCard } from "../define.js";

// EDHREC rank 21234.
const ETB_TEXT =
  "When this creature enters, look at the top five cards of your library. You may reveal a land card or a card with {X} in its mana cost from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Paradox Surveyor",
  manaCost: "{G}{G/U}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ type: "land" }, { xInManaCost: true }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
