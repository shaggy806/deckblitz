import { defineCard } from "../define.js";

// EDHREC rank 28364.

export default defineCard({
  name: "Grave Bramble",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant"],
  power: 3,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender, protection from Zombies",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Zombie" } },
      text: "Protection from Zombies",
    },
  ],
});
