import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 31475.
//
// Rulings:
//   If the target is turned face up before the ability resolves, the creature is no longer a
//     legal target and is not destroyed. (The `faceDown` filter is rechecked as it resolves.)

const TEXT = "{T}, Sacrifice this creature: Destroy target face-down creature.";

export default defineCard({
  name: "Nosy Goblin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", faceDown: true } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
