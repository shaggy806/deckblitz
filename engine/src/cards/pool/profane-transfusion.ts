import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Rulings:
//   Use the difference between the life totals after the exchange to determine the size of the
//   Horror token. Because replacement effects can modify the life gain and life loss, this number
//   may be different from what it was before the exchange.
//   If a player can't gain life, that player can't exchange life totals with a player with a
//   higher life total. Similarly, a player who can't lose life can't exchange life totals with a
//   player with a lower life total.

export default defineCard({
  name: "Profane Transfusion",
  manaCost: "{6}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Two target players exchange life totals. You create an X/X colorless Horror artifact creature token, where X is the difference between those players' life totals.",
  targets: distinctTargets(2, "player"),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exchange-life-totals", first: { target: 0 }, second: { target: 1 } },
      {
        kind: "create-token",
        token: "Horror Token (Profane Transfusion)",
        count: 1,
        basePt: { power: { lifeDifference: [0, 1] }, toughness: { lifeDifference: [0, 1] } },
      },
    ],
  },
});
