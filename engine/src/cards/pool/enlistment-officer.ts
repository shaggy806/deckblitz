import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 25647. Goblin Ringleader's shape, for Soldiers.

const ENTER_TEXT =
  "When this creature enters, reveal the top four cards of your library. Put all Soldier cards revealed this way into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Enlistment Officer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // "All Soldier cards": `min` = `max` = 4 is clamped to the Soldiers
      // among the four, so every one of them is taken.
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 4,
        max: 4,
        filter: { subtype: "Soldier" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
