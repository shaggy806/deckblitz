import { defineCard } from "../define.js";

// Rulings: the cards chosen can be ones just milled or ones already there, and
// they enter together. No card is a target. The creatures you control then are
// Phyrexians until they leave (they stop being one while they aren't
// creatures, which is why it's a subtype set on creatures you control now,
// lasting as long as each stays).
const TEXT =
  "Each player mills ten cards. For each player, choose a creature or planeswalker card in that player's graveyard. Put those cards onto the battlefield under your control. Then each creature you control becomes a Phyrexian in addition to its other types.";

export default defineCard({
  name: "Breach the Multiverse",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "each-player", amount: 10 },
      {
        kind: "for-each-player",
        who: "each-player",
        choicesHeld: true,
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          from: "that-player",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
          min: 1,
          max: 1,
          destination: "battlefield",
          leftover: "stay",
        },
      },
      {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you" },
        effect: { kind: "become", target: 0, addSubtypes: ["Phyrexian"], duration: "permanent" },
      },
    ],
  },
});
