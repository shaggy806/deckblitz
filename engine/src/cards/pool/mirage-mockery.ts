import { defineCard } from "../define.js";

// EDHREC rank 9595.
//
// Rulings:
//   [2023-02-04] If you cast the spell by paying its entwine cost, the tokens don't enter the
//     battlefield at the same time. The token that's a copy of the artifact creature enters the
//     battlefield first, followed by the token that's a copy of the nonartifact creature. Then any
//     abilities that triggered due to either of them entering the battlefield are put on the
//     stack.
//   [2023-02-04] If the copied creature has {X} in its mana cost, X is 0.
//   [2023-02-04] If the copied creature is copying something else, then the token enters the
//     battlefield as whatever that creature copied.
//   [2023-02-04] The token copies exactly what was printed on the original creature and nothing
//     else (unless that permanent is copying something else or it is a token; see below). It
//     doesn't copy whether that creature is tapped or untapped, whether it has any counters on it
//     or Auras and Equipment attached to it, and so on.
//   [2023-02-04] Any enters-the-battlefield abilities of the copied creature will trigger when the
//     token enters the battlefield. Any "as [this creature] enters the battlefield" or "[this
//     creature] enters the battlefield with" abilities of the chosen creature will also work.
//   [2023-02-04] If the copied creature is a token, the new token that's created copies the
//     original characteristics of that token as stated by the effect that created that token.

export default defineCard({
  name: "Mirage Mockery",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "{2}{U}", keyword: "entwine" },
  text: "Choose one —\n• Create a token that's a copy of target artifact creature you control.\n• Create a token that's a copy of target nonartifact creature you control.\nEntwine {2}{U} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Create a token that's a copy of target artifact creature you control.",
        targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", typesAnyOf: ["artifact"] } }],
        effect: { kind: "create-token-copy", of: 0, count: 1 },
      },
      {
        text: "Create a token that's a copy of target nonartifact creature you control.",
        targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notTypes: ["artifact"] } }],
        effect: { kind: "create-token-copy", of: 0, count: 1 },
      },
    ],
  },
});
