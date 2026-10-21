import { defineCard } from "../define.js";

// EDHREC rank 17270.
//
// Rulings:
//   If you can't place -1/-1 counters on any creatures you control (probably because you control
//     no creatures), you can't choose to blight.
//
// The Aura is sacrificed as a cost, so "enchanted creature" is the one it
// last enchanted (`"attached"`), if that is still on the battlefield.

const EXILE =
  "{1}{W}, Blight 1, Sacrifice this Aura: Exile enchanted creature. (To blight 1, put a -1/-1 counter on a creature you control.)";

export default defineCard({
  name: "Spiral into Solitude",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack or block.\n${EXILE}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, blight: 1, sacrifice: "self" },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: EXILE,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
  ],
});
