import { defineCard } from "../define.js";

export default defineCard({
  name: "Inkfathom Divers",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["islandwalk"],
  text: "Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\nWhen this creature enters, look at the top four cards of your library, then put them back in any order.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 4,
        max: 4,
        destination: "library-top",
        leftover: "stay",
      },
      resolve: null,
      text: "When this creature enters, look at the top four cards of your library, then put them back in any order.",
    },
  ],
});
