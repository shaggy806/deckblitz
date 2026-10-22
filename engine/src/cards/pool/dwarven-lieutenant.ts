import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 24587.
const TEXT = "{1}{R}: Target Dwarf creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Dwarven Lieutenant",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Dwarf" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
