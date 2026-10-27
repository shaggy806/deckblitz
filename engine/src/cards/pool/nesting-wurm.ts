import { defineCard } from "../define.js";

// EDHREC rank 31899. Squadron Hawk's search.

const TEXT =
  "When this creature enters, you may search your library for up to three cards named Nesting Wurm, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Nesting Wurm",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for up to three cards named Nesting Wurm?",
        effect: { kind: "search-library", filter: { name: "Nesting Wurm" }, destination: "hand", reveal: true, min: 0, max: 3 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
