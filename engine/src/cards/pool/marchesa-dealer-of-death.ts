import { defineCard } from "../define.js";

const CRIME_TEXT =
  "Whenever you commit a crime, you may pay {1}. If you do, look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.";

// The {1} is paid as the trigger resolves. With one card left in the library
// it goes to the hand (the ruling): `min: 1` over whatever is there.
export default defineCard({
  name: "Marchesa, Dealer of Death",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 4,
  text: `${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to look at the top two cards of your library?",
        cost: "{1}",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 2,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "graveyard",
        },
      },
      resolve: null,
      text: CRIME_TEXT,
    },
  ],
});
