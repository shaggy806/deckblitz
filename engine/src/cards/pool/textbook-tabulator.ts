import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

// EDHREC rank 18061. Secrets of Strixhaven.

const INCREMENT = increment();
const SURVEIL_TEXT = "When this creature enters, surveil 2.";

export default defineCard({
  name: "Textbook Tabulator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Frog", "Wizard"],
  power: 0,
  toughness: 3,
  text: `${INCREMENT.text}\n${SURVEIL_TEXT} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  triggered: [
    INCREMENT,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
