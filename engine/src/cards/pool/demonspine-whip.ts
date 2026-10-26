import { defineCard } from "../define.js";

// EDHREC rank 22737.
//
// Rulings:
//   The bonus goes to the creature the Whip is attached to as the ability
//     resolves — or, the Whip gone, the one it was last attached to — and
//     stays with it for the turn (`"attached"`).

const PUMP_TEXT = "{X}: Equipped creature gets +X/+0 until end of turn.";

export default defineCard({
  name: "Demonspine Whip",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\nEquip {1}`,
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "attached", power: "x", toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
