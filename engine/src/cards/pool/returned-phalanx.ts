import { defineCard } from "../define.js";

const ATTACK_TEXT = "{1}{U}: This creature can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Returned Phalanx",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${ATTACK_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
