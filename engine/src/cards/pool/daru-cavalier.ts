import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 32136. Wretched Throng's self-tutor on entering.

const ETB_TEXT =
  "When this creature enters, you may search your library for a card named Daru Cavalier, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Daru Cavalier",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Daru Cavalier?",
        effect: { kind: "search-library", filter: { name: "Daru Cavalier" }, destination: "hand", min: 0, max: 1, reveal: true },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
