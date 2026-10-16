import { defineCard } from "../define.js";

const CRIME_TEXT =
  "Whenever you commit a crime, look at the top five cards of your library. You may put a land card from among them onto the battlefield tapped. Put the rest on the bottom of your library in a random order. This ability triggers only once each turn.";

export default defineCard({
  name: "Freestrider Lookout",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "bottom-random",
      },
      resolve: null,
      oncePerTurn: true,
      text: CRIME_TEXT,
    },
  ],
});
