import { defineCard } from "../define.js";

// EDHREC rank 14509.
// Makes Goblin Army by amassing → the engine's "Army Token" (amass adds Goblin).
const ETB_TEXT =
  "When this creature enters, amass Goblins 1. (Put a +1/+1 counter on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)";

export default defineCard({
  name: "Goblin-town Flunkies",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Goblin" },
      resolve: null,
      text: "When this creature enters, amass Goblins 1.",
    },
  ],
});
