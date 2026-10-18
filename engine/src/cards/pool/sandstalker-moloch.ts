import { defineCard } from "../define.js";

// EDHREC rank 24375.
//
// Rulings:
//   [2023-04-14] It doesn't matter if the blue and/or black spell an opponent cast that turn
//     resolved, didn't resolve, was countered, or is still on the stack.
//
// The intervening-if (rule 603.4) counts the spells opponents cast this turn,
// each as it was cast; Boughside Wanderers' look.

const TEXT =
  "When this creature enters, if an opponent cast a blue and/or black spell this turn, look at the top four cards of your library. You may reveal a permanent card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Sandstalker Moloch",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 4,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "cast-this-turn",
        who: "opponent",
        filter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { notTypes: ["instant", "sorcery"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
