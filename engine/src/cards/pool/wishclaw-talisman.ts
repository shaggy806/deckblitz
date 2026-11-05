import { defineCard } from "../define.js";

// EDHREC rank 525.
//
// Rulings:
//   [2019-10-04] You choose which opponent gains control of Wishclaw Talisman while its ability is
//     resolving. If that player later leaves the game, you regain control of Wishclaw Talisman.
//   [2019-10-04] Once Wishclaw Talisman runs out of wish counters, it remains on the battlefield.
//     You can't activate its last ability at all.

const ENTERS = "This artifact enters with three wish counters on it.";
const WISH =
  "{1}, {T}, Remove a wish counter from this artifact: Search your library for a card, put it into your hand, then shuffle. An opponent gains control of this artifact. Activate only during your turn.";

export default defineCard({
  name: "Wishclaw Talisman",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${ENTERS}\n${WISH}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, removeCounter: { kind: "wish", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
          {
            kind: "choose-opponent",
            then: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
          },
        ],
      },
      resolve: null,
      text: WISH,
      condition: { kind: "your-turn" },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "wish", amount: 3 } },
      text: ENTERS,
    },
  ],
});
