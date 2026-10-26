import { defineCard } from "../define.js";

// EDHREC rank 23385.
//
// Rulings:
//   [2017-11-17] You don’t have to declare which card you’re searching for when you activate
//     Bogbrew Witch’s ability. You may find either while you’re searching.

const TEXT =
  "{2}, {T}: Search your library for a card named Festering Newt or Bubbling Cauldron, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Bogbrew Witch",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { anyOf: [{ name: "Festering Newt" }, { name: "Bubbling Cauldron" }] },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
