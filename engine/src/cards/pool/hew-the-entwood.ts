import { defineCard } from "../define.js";

// EDHREC rank 13639.
//
// Rulings:
//   [2023-06-16] Any abilities that trigger during the resolution of Hew the Entwood will wait to
//     be put on the stack until everything is put on the battlefield and resolution is complete.
//   [2023-06-16] You sacrifice the lands as part of the resolution of Hew the Entwood. It isn't an
//     additional cost. If Hew the Entwood is countered, you won't sacrifice any lands.
//
// The lands are sacrificed as it resolves (Scapeshift's shape), X being how
// many. The one choice of "artifact and/or land cards" is asked in the order
// the cards move: the nonland artifact cards first, onto the battlefield
// untapped, then the land cards (an artifact land among them), tapped; the
// rest go to the bottom in a random order. Every card is revealed before
// either pick, and triggers wait for the whole resolution (the ruling), so
// nothing the player learns between the two picks is new.

const TEXT =
  "Sacrifice any number of lands. Reveal the top X cards of your library, where X is the number of lands sacrificed this way. Choose any number of artifact and/or land cards revealed this way. Put all nonland cards chosen this way onto the battlefield, then put all land cards chosen this way onto the battlefield tapped, then put the rest on the bottom of your library in a random order.";
const X = { thisWay: "sacrificed" } as const;

export default defineCard({
  name: "Hew the Entwood",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        upTo: { countOf: { type: "land", controlledBy: "you" } },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of lands",
      },
      {
        kind: "look-and-choose",
        zone: "library",
        count: X,
        reveal: true,
        min: 0,
        max: X,
        filter: { type: "artifact", notTypes: ["land"] },
        destination: "battlefield",
        leftover: "bottom-random",
        secondPick: {
          filter: { type: "land" },
          min: 0,
          max: X,
          destination: "battlefield",
          enterTapped: true,
        },
      },
    ],
  },
});
