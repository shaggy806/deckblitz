import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

const ENTER_TEXT =
  "When this Siege enters, search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Invasion of Zendikar",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 3,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", supertype: "basic" },
        destination: "battlefield",
        min: 0,
        max: 2,
        enterTapped: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Zendikar", "Awakened Skyclave"],
  transform: true,
});
