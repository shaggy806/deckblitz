import { defineCard } from "../define.js";

// EDHREC rank 6785.

export default defineCard({
  name: "Spider-Man, Brooklyn Visionary",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 3,
  webSlinging: { cost: "{2}{G}" },
  text: "Web-slinging {2}{G} (You may cast this spell for {2}{G} if you also return a tapped creature you control to its owner's hand.)\nWhen Spider-Man enters, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: "When Spider-Man enters, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    },
  ],
});
