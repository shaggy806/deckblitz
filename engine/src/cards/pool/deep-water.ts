import { defineCard } from "../define.js";

// The Dark.
//
// A turn-long player effect (`player-effect` with `manaProduction`): until end of turn, each land
// its controller taps for mana produces {U} instead of any other type (rules 106.12, 614.1a) — the
// amount kept, and mana that triggered abilities add on the tap isn't the land's.

const TEXT = "{U}: Until end of turn, if you tap a land you control for mana, it produces {U} instead of any other type.";

export default defineCard({
  name: "Deep Water",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", manaProduction: { filter: { type: "land", controlledBy: "you" }, produces: "U", tapper: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
