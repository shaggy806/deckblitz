import { defineCard } from "../define.js";

const TEXT =
  "Federation — Exile target instant or sorcery card from your graveyard. Copy that card X times, where X is the number of creature types among non-Borg creatures you control. You may cast the copies without paying their mana costs. Exile Infinite Diversity.";

export default defineCard({
  name: "Infinite Diversity",
  manaCost: "{7}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "cast-now",
        from: "exiled-this-way",
        // Federation's X: the different creature types among your non-Borg creatures.
        copies: {
          aggregate: "distinct",
          of: { subtypesOf: "creature" },
          filter: { type: "creature", controlledBy: "you", notSubtypes: ["Borg"] },
        },
        free: true,
      },
    ],
  },
  exileOnResolve: true,
});
