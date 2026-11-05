import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, look at the top two cards of target player's library. Put one of them into their graveyard.";

export default defineCard({
  name: "Wu Spy",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "graveyard",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
