import { defineCard } from "../define.js";

// EDHREC rank 11373.
//
// Thundertrap Trainer's look: a "Goblin, Swamp, or Mountain card" is any one
// of the three subtypes (`subtypes` is an OR, read through `hasSubtype`, so a
// changeling card is a Goblin card too).
const LOOK_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a Goblin, Swamp, or Mountain card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Eclipsed Boggart",
  manaCost: "{B/R}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 2,
  toughness: 3,
  text: LOOK_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { subtypes: ["Goblin", "Swamp", "Mountain"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
