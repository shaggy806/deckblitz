import { defineCard } from "../define.js";

export default defineCard({
  name: "Amazing Spider-Man",
  art: "https://cards.scryfall.io/art_crop/back/3/c/3ce33422-5dba-4a42-8375-dd8ccc692a7b.jpg",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance", "reach"],
  text: "Vigilance, reach\nEach legendary spell you cast that's one or more colors has web-slinging {G}{W}{U}. (You may cast a spell for its web-slinging cost if you also return a tapped creature you control to its owner's hand.)",
  faces: ["Peter Parker", "Amazing Spider-Man"],
  static: [
    {
      // "One or more colors": any of the five.
      affects: { scope: "self" },
      grantsToSpells: {
        filter: {
          supertype: "legendary",
          anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
        },
        webSlinging: "{G}{W}{U}",
      },
      text: "Each legendary spell you cast that's one or more colors has web-slinging {G}{W}{U}.",
    },
  ],
});
