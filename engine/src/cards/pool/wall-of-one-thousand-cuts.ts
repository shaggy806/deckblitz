import { defineCard } from "../define.js";

// EDHREC rank 22536.

export default defineCard({
  name: "Wall of One Thousand Cuts",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 3,
  toughness: 5,
  keywords: ["defender", "flying"],
  text: "Defender, flying\n{W}: This creature can attack this turn as though it didn't have defender.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: "{W}: This creature can attack this turn as though it didn't have defender.",
    },
  ],
});
