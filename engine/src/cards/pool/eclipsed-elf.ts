import { defineCard } from "../define.js";

// EDHREC rank 7957.
//
// Thundertrap Trainer's look: an "Elf, Swamp, or Forest card" is any one of
// the three subtypes (`subtypes` is an OR, read through `hasSubtype`, so a
// changeling card is an Elf card too).
const LOOK_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal an Elf, Swamp, or Forest card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Eclipsed Elf",
  manaCost: "{B/G}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 3,
  toughness: 2,
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
        filter: { subtypes: ["Elf", "Swamp", "Forest"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
