import { defineCard } from "../define.js";

// EDHREC rank 29581. Wall of One Thousand Cuts' ability.

const TEXT = "{W}: This creature can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Mirror Wall",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 3,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
