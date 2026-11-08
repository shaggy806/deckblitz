import { defineCard } from "../define.js";

// EDHREC rank 3077. Hive Mind is a `mills` trigger: once for each player's
// mill that put one or more creature cards into a graveyard.

const HIVE_TEXT = "Hive Mind — Whenever a player mills one or more creature cards, you create a 1/1 black Horror creature token.";
const MILL_TEXT = "{1}, {T}: Target player mills three cards.";
const BACKGROUND_TEXT = "Choose a Background (You can have a Background as a second commander.)";

export default defineCard({
  name: "Zellix, Sanity Flayer",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 3,
  pairing: { kind: "choose-a-background" },
  text: `${HIVE_TEXT}\n${MILL_TEXT}\n${BACKGROUND_TEXT}`,
  triggered: [
    {
      trigger: { on: "mills", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Horror Token (Black 1/1)", count: 1 },
      resolve: null,
      text: HIVE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
