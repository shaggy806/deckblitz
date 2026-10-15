import { defineCard } from "../define.js";

// EDHREC rank 24100.

const ATTACK_TEXT = "{2}{G}: This creature can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Krotiq Nestguard",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${ATTACK_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
