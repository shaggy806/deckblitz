import { defineCard } from "../define.js";
import { hauntSpell } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 26094.
// Makes Spirit → use "Spirit Token".
//
// Rulings:
//   [2006-02-01] A "nonwhite nonblack" creature is a creature that's neither white nor black. It
//     can be any other color or combination of colors, or it can be colorless.
//   [2006-02-01] If you can't choose a nonwhite nonblack creature to target when the haunted
//     creature is put into a graveyard, or if the target becomes illegal, you don't get a token.

export default defineCard({
  name: "Seize the Soul",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonwhite, nonblack creature. Create a 1/1 white Spirit creature token with flying.\nHaunt (When this spell card is put into a graveyard after resolving, exile it haunting target creature.)\nWhen the creature this card haunts dies, destroy target nonwhite, nonblack creature. Create a 1/1 white Spirit creature token with flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", notColors: ["W", "B"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "create-token", token: "Spirit Token", count: 1 },
    ],
  },
  triggered: [
    hauntSpell(),
    {
      trigger: { on: "haunted-dies" },
      targets: [{ kind: "permanent", filter: { type: "creature", notColors: ["W", "B"] } }],
      effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "create-token", token: "Spirit Token", count: 1 },
    ],
  },
      resolve: null,
      text: "When the creature this card haunts dies, destroy target nonwhite, nonblack creature. Create a 1/1 white Spirit creature token with flying.",
    },
  ],
});
