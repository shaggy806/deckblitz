import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 7445.

const ENTER_TEXT =
  "When this Siege enters, search your library for an Aura, God, or Demigod card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Invasion of Theros",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtypes: ["Aura", "God", "Demigod"] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Theros", "Ephara, Ever-Sheltering"],
  transform: true,
});
