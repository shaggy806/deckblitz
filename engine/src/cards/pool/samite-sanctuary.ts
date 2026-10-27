import { defineCard } from "../define.js";

// EDHREC rank 30269. "Any player may activate this ability": `anyPlayer`.

const TEXT =
  "{2}: Prevent the next 1 damage that would be dealt to target creature this turn. Any player may activate this ability.";

export default defineCard({
  name: "Samite Sanctuary",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      anyPlayer: true,
      text: TEXT,
    },
  ],
});
