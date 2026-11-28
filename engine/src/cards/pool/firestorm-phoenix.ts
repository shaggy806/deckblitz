import { defineCard } from "../define.js";

// EDHREC rank 29513. Legends.
//
// Its own "would die" replacement (`self`, `from: "battlefield"`) sends it to
// its owner's hand, and the replacement's `then` binds a `cast` and a
// `play-land` prohibition to that card in this stint of it (rule 400.7), for
// its owner, until that player's next turn begins: another Firestorm Phoenix
// in the hand can be cast, and this one can still be put onto the battlefield
// by an effect (its rulings). "Plays with that card revealed in their hand":
// it came from the battlefield, a public zone, so every player knows it while
// it stays in the hand (`knownToAll`).

const TEXT =
  "If this creature would die, return it to its owner's hand instead. Until that player's next turn, that player plays with that card revealed in their hand and can't play it.";

export default defineCard({
  name: "Firestorm Phoenix",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "hand",
        self: true,
        from: "battlefield",
        then: {
          kind: "prohibit",
          prohibits: [
            { act: "cast", who: { ownerOf: "source" }, target: "source" },
            { act: "play-land", who: { ownerOf: "source" }, target: "source" },
          ],
          duration: { untilTurnOf: { ownerOf: "source" } },
        },
      },
      text: TEXT,
    },
  ],
});
