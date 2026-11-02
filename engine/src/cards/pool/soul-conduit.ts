import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Rulings:
//   If a player can't gain life, that player can't exchange life totals with a player with a
//   higher life total. If a player can't lose life, that player can't exchange life totals with a
//   player with a lower life total. In either of these cases, neither player's life total will
//   change.
//   If one of the targeted players is an illegal target when the activated ability tries to
//   resolve, the exchange won't happen. Neither player's life total will change.

const TEXT = "{6}, {T}: Two target players exchange life totals.";

export default defineCard({
  name: "Soul Conduit",
  manaCost: "{6}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: distinctTargets(2, "player"),
      effect: { kind: "exchange-life-totals", first: { target: 0 }, second: { target: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
