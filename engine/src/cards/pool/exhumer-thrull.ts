import { defineCard } from "../define.js";
import { haunt } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 28789.
//
// Rulings:
//   [2006-02-01] If you own the creature Exhumer Thrull was haunting, that creature will generally
//     be a legal target for the haunt trigger to return to your hand.

export default defineCard({
  name: "Exhumer Thrull",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 3,
  toughness: 3,
  text: "Haunt (When this creature dies, exile it haunting target creature.)\nWhen this creature enters or the creature it haunts dies, return target creature card from your graveyard to your hand.",
  triggered: [
    haunt(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, return target creature card from your graveyard to your hand.",
    },
    {
      trigger: { on: "haunted-dies" },
      sameAbilityAs: 1,
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, return target creature card from your graveyard to your hand.",
    },
  ],
});
