import { defineCard } from "../define.js";

// EDHREC rank 24617. "Activate only during your upkeep" is your turn and the
// upkeep step together.

const TEXT = "{T}, Sacrifice an artifact: Put a +1/+1 counter on target creature. Activate only during your upkeep.";

export default defineCard({
  name: "Dwarven Weaponsmith",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      text: TEXT,
    },
  ],
});
