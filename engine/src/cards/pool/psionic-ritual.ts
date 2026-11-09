import { defineCard } from "../define.js";

export default defineCard({
  name: "Psionic Ritual",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  replicate: { cost: "", also: { text: "Tap an untapped Horror you control", tapUntapped: { filter: { subtype: "Horror" }, count: 1 } } },
  exileOnResolve: true,
  text: "Replicate—Tap an untapped Horror you control. (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nExile target instant or sorcery card from a graveyard and copy it. You may cast the copy without paying its mana cost.\nExile Psionic Ritual.",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
    ],
  },
});
