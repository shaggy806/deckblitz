import { defineCard } from "../define.js";

// EDHREC rank 17536. "Any player may activate this ability" (`anyPlayer`):
// whoever activates it controls the ability (rule 602.2a), so they pay the
// {1}, sacrifice one of **their** lands, and draw.

const TEXT = "{1}, Sacrifice a land: Draw a card. Any player may activate this ability.";

export default defineCard({
  name: "Excavation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      anyPlayer: true,
      text: TEXT,
    },
  ],
});
