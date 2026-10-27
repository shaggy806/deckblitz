import { defineCard } from "../define.js";

// EDHREC rank 32184.
//
// "It" is the sacrificed Scout, the ability's source, as it last existed.
const TEXT = "{2}{G}, Sacrifice this creature: It deals 2 damage to target creature with flying.";

export default defineCard({
  name: "Viridian Scout",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior", "Scout"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", target: 0, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
