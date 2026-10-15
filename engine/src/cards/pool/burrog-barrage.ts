import { defineCard } from "../define.js";

// EDHREC rank 20746.
//
// "If you've cast another instant or sorcery spell this turn" is asked as it
// resolves: cast, this spell is one of the turn's instants and sorceries, so
// another makes two; a copy was never cast, so any one cast is "another"
// (`source`'s `cast`). "Then it deals damage equal to its power" is a
// one-sided fight with the second target, which is optional.
const TEXT =
  "Target creature you control gets +1/+0 until end of turn if you've cast another instant or sorcery spell this turn. Then it deals damage equal to its power to up to one target creature an opponent controls.";
const INSTANT_OR_SORCERY = { typesAnyOf: ["instant", "sorcery"] } as const;

export default defineCard({
  name: "Burrog Barrage",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            {
              kind: "all",
              of: [
                { kind: "source", filter: { cast: true } },
                { kind: "cast-this-turn", filter: INSTANT_OR_SORCERY, atLeast: 2 },
              ],
            },
            {
              kind: "all",
              of: [
                { kind: "not", of: { kind: "source", filter: { cast: true } } },
                { kind: "cast-this-turn", filter: INSTANT_OR_SORCERY, atLeast: 1 },
              ],
            },
          ],
        },
        then: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
