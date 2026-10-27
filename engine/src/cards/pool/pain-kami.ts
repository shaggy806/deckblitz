import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 30014. "It" is the sacrificed
// creature, dealing the damage as it last existed (Sarpadian Simulacrum's shape).

const TEXT = "{X}{R}, Sacrifice this creature: It deals X damage to target creature.";

export default defineCard({
  name: "Pain Kami",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{R}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
