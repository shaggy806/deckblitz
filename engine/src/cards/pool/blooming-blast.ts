import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// EDHREC rank 15323. Promised, the Treasure comes first, then 2 damage to the
// creature and 3 to its controller (Heated Argument's `toControllerOfTarget`);
// a target gone illegal stops the whole spell, gift included (the rulings).
export default defineCard({
  name: "Blooming Blast",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Gift a Treasure (You may promise an opponent a gift as you cast this spell. If you do, they create a Treasure token before its other effects. It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")\n" +
    "Blooming Blast deals 2 damage to target creature. If the gift was promised, Blooming Blast also deals 3 damage to that creature's controller.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 2, target: 0 },
  kicker: {
    ...GIFT_KICKER,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "treasure" },
        { kind: "damage", amount: 2, target: 0 },
        { kind: "damage", amount: 3, toControllerOfTarget: 0 },
      ],
    },
  },
});
