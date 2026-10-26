import { defineCard } from "../define.js";

// EDHREC rank 28885.
//
// Rulings:
//   [2008-08-01] A hybrid creature that’s green and another color is *not* a nongreen creature.
//     Since it’s green, it can’t be nongreen!
//   [2008-08-01] Although Soul Reap says it looks for “another black spell,” there’s no
//     requirement that Soul Reap actually be cast (or be black) for this part of its ability to
//     work. For example, if a spell such as Commandeer causes you to gain control of Soul Reap,
//     it’ll still check whether you cast a black spell this turn, even though you didn’t cast Soul
//     Reap itself.
//   [2008-08-01] Soul Reap doesn’t check whether you’ve cast another black spell until Soul Reap
//     resolves. If you cast Soul Reap, then cast a black instant in response, the creature’s
//     controller will lose the life when Soul Reap resolves.
//
// Slick Sequence's "another spell" shape: cast, Soul Reap is one of the black
// spells you cast this turn, so it takes two; not cast, one.

export default defineCard({
  name: "Soul Reap",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target nongreen creature. Its controller loses 3 life if you've cast another black spell this turn.",
  targets: [{ kind: "permanent", filter: { notColors: ["G"], type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            {
              kind: "all",
              of: [
                { kind: "source", filter: { cast: true } },
                { kind: "cast-this-turn", filter: { colors: ["B"] }, atLeast: 2 },
              ],
            },
            {
              kind: "all",
              of: [
                { kind: "not", of: { kind: "source", filter: { cast: true } } },
                { kind: "cast-this-turn", filter: { colors: ["B"] }, atLeast: 1 },
              ],
            },
          ],
        },
        then: { kind: "lose-life", amount: 3, toControllerOfTarget: 0 },
      },
    ],
  },
});
