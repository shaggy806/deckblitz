import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 23235. Goblin Ringleader's shape, for Merfolk.

const ENTER_TEXT =
  "When this creature enters, reveal the top four cards of your library. Put all Merfolk cards revealed this way into your hand and the rest on the bottom of your library in any order.";
const FLY_TEXT = "{3}{U}: This creature gains flying until end of turn.";

export default defineCard({
  name: "Tidal Courier",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 1,
  toughness: 2,
  text: `${ENTER_TEXT}\n${FLY_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: FLY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // "All Merfolk cards": `min` = `max` = 4 is clamped to the Merfolk
      // among the four, so every one of them is taken.
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 4,
        max: 4,
        filter: { subtype: "Merfolk" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
