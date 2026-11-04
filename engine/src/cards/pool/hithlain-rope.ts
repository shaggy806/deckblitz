import { defineCard } from "../define.js";

// Rulings:
//   In some formats, such as Two-Headed Giant, the player to your right might be a teammate. In
//     that case, that teammate gains control of Hithlain Rope as either ability resolves.
//   In a two-player game, the other player is the player to your right.
//
// "Your" is the activating controller's, read as the ability resolves. The control change is the
// ability's last instruction, and lasts for good.
const STATIC = "This artifact can't be sacrificed.";
const SEARCH =
  "{1}, {T}: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. The player to your right gains control of this artifact.";
const DRAW = "{2}, {T}: Draw a card. The player to your right gains control of this artifact.";

export default defineCard({
  name: "Hithlain Rope",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${STATIC}\n${SEARCH}\n${DRAW}`,
  static: [{ affects: { scope: "self" }, cantBeSacrificed: true, text: STATIC }],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { supertype: "basic", type: "land" },
            destination: "battlefield",
            min: 0,
            max: 1,
            enterTapped: true,
          },
          { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "player-to-your-right" },
        ],
      },
      resolve: null,
      text: SEARCH,
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "player-to-your-right" },
        ],
      },
      resolve: null,
      text: DRAW,
    },
  ],
});
