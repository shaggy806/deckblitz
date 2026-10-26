import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, you may search your library for a Kithkin card, reveal it, then shuffle and put that card on top.";

export default defineCard({
  name: "Kithkin Harbinger",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Wizard"],
  power: 1,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Kithkin card?",
        effect: { kind: "search-library", filter: { subtype: "Kithkin" }, destination: "library-top", reveal: true, min: 0, max: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
