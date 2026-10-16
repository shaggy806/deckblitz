import { defineCard } from "../define.js";

// EDHREC rank 9296. Sarinth Steelseeker's look: a creature card may be
// revealed and taken (min 0); a card not taken may then go to the graveyard
// (`secondPick`), or stay on top (the ruling).
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, look at the top card of your library. If it's a creature card, you may reveal it and put it into your hand. If you don't put the card into your hand, you may put it into your graveyard.";

export default defineCard({
  name: "Territory Culler",
  manaCost: "{4}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 7,
  toughness: 5,
  keywords: ["reach"],
  text: `Devoid (This card has no color.)\nReach\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        secondPick: { min: 0, max: 1, destination: "graveyard" },
        leftover: "stay",
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
