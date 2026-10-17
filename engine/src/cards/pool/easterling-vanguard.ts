import { defineCard } from "../define.js";

// EDHREC rank 13959.

const TEXT = "When this creature dies, amass Orcs 1.";

export default defineCard({
  name: "Easterling Vanguard",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: `${TEXT} (Put a +1/+1 counter on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Orc" },
      resolve: null,
      text: TEXT,
    },
  ],
});
