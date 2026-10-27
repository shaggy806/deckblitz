import { defineCard } from "../define.js";

// Apocalypse (APC). Goblin Ringleader's shape, for Elves.
const TEXT =
  "When this creature enters, reveal the top four cards of your library. Put all Elf cards revealed this way into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Sylvan Messenger",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 4,
        max: 4,
        filter: { subtype: "Elf" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
