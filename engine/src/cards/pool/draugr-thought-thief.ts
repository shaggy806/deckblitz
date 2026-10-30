import { defineCard } from "../define.js";

// EDHREC rank 24332.

const TEXT =
  "When this creature enters, look at the top card of target player's library. You may put that card into their graveyard.";

export default defineCard({
  name: "Draugr Thought-Thief",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Rogue"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        destination: "graveyard",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
