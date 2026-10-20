import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

export default defineCard({
  name: "Mystic Monstrosity",
  art: "https://cards.scryfall.io/art_crop/back/1/1/115a9a44-131d-45f3-852a-40fd18e4afb6.jpg",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 6,
  text: "Lands you control have \"{T}: Add one mana of any color.\"",
  static: [
    {
      affects: { scope: "lands-you-control" },
      grantsActivated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
      text: "Lands you control have \"{T}: Add one mana of any color.\"",
    },
  ],
  faces: ["Mystic Skull", "Mystic Monstrosity"],
  transform: true,
});
