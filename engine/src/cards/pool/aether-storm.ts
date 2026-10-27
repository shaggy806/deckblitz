import { defineCard } from "../define.js";

// A prohibition on every player, and an ability any player may activate
// (`anyPlayer`), paying their own 4 life.

const DESTROY_TEXT = "Pay 4 life: Destroy this enchantment. It can't be regenerated. Any player may activate this ability.";

export default defineCard({
  name: "Aether Storm",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Creature spells can't be cast.\n${DESTROY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", spells: { type: "creature" } },
      text: "Creature spells can't be cast.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 4 },
      targets: [],
      effect: { kind: "destroy", target: "source", cantBeRegenerated: true },
      resolve: null,
      anyPlayer: true,
      text: DESTROY_TEXT,
    },
  ],
});
