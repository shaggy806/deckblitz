import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 23941.

const TEXT = "{T}, Sacrifice this creature: Destroy target attacking or blocking creature with flying.";

export default defineCard({
  name: "Skyshooter",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Archer"],
  power: 1,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "creature", keyword: "flying", anyOf: [{ attacking: true }, { blocking: true }] },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
