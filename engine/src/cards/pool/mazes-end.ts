import { defineCard } from "../define.js";

// EDHREC rank 2970.
//
// Rulings:
//   [2013-04-15] Returning Maze's End to its owner's hand is part of the cost to activate its last
//     ability. Once that ability is announced, players can't respond to it until after you've paid
//     its activation cost and returned Maze's End to hand.
//   [2013-04-15] Putting a Gate onto the battlefield with Maze's End doesn't count as the one land
//     you can play during your turn. If it's your turn, you can play Maze's End or a different
//     land card from your hand after its ability has resolved.
//   [2013-04-15] Controlling multiple Gates with the same name has no effect on your ability to
//     win the game with Maze's End. The excess Gates are simply ignored.
//   [2013-04-15] When the last ability of Maze's End resolves, you'll search for a Gate and put it
//     onto the battlefield before checking to see if you win the game. This check will happen even
//     if you don't put a Gate onto the battlefield this way. This check will happen only as the
//     ability resolves, not at other times.

export default defineCard({
  name: "Maze's End",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {C}.\n{3}, {T}, Return this land to its owner's hand: Search your library for a Gate card, put it onto the battlefield, then shuffle. If you control ten or more Gates with different names, you win the game.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}", tap: true, returnSelfToHand: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: { subtype: "Gate" }, destination: "battlefield", min: 0, max: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 10, distinctNames: true },
            then: { kind: "win-game" },
          },
        ],
      },
      resolve: null,
      text: "{3}, {T}, Return this land to its owner's hand: Search your library for a Gate card, put it onto the battlefield, then shuffle. If you control ten or more Gates with different names, you win the game.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
