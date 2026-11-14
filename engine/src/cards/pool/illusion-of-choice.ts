import { defineCard } from "../define.js";

// Rulings:
//   [2016-08-23] If multiple players cast Illusion of Choice during the same
//     turn, the controller of the one that resolved most recently will choose
//     how each player votes that turn.
//   [2016-08-23] If another player controls Ballot Broker, that player first
//     takes their "normal" vote with you choosing the result, then that player
//     decides whether they are taking the additional vote. If there is an
//     additional vote, you again choose the result.
export default defineCard({
  name: "Illusion of Choice",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You choose how each player votes this turn.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "choose-combat", votes: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
