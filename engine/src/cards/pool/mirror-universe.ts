import { defineCard } from "../define.js";

// Rulings:
//   Each player gains or loses the amount of life necessary to equal the other player's previous
//   life total. Replacement effects may modify these gains and losses.
//   If an effect says that a player can't lose life, that player can't exchange life totals with
//   a player who has a lower life total; in that case, the exchange won't happen.

const TEXT = "{T}, Sacrifice this artifact: Exchange life totals with target opponent. Activate only during your upkeep.";

export default defineCard({
  name: "Mirror Universe",
  manaCost: "{6}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: ["opponent"],
      effect: { kind: "exchange-life-totals", second: { target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
