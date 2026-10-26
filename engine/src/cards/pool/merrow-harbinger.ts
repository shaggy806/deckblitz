import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, you may search your library for a Merfolk card, reveal it, then shuffle and put that card on top.";

export default defineCard({
  name: "Merrow Harbinger",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Merfolk card?",
        effect: { kind: "search-library", filter: { subtype: "Merfolk" }, destination: "library-top", reveal: true, min: 0, max: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
