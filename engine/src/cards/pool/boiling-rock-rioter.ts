import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 13227.
//
// Rulings:
//   [2025-10-02] Since Boiling Rock Rioter's activated ability doesn't have a tap symbol in its
//     cost, you can tap a creature (including Boiling Rock Rioter itself) that hasn't been under
//     your control since your most recent turn began to pay the cost.
//
// The exile and the cast are linked abilities (rule 607.2a): the card is
// exiled with this stint of the Rioter (`linked`), and the attack trigger
// offers the Ally cards you own among them (`exiled-with-source`) — cast now,
// timing ignored, paying their costs.

const FIREBENDING_TEXT = "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)";
const EXILE_TEXT = "Tap an untapped Ally you control: Exile target card from a graveyard.";
const CAST_TEXT =
  "Whenever this creature attacks, you may cast an Ally spell from among cards you own exiled with this creature.";

export default defineCard({
  name: "Boiling Rock Rioter",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Ally"],
  power: 3,
  toughness: 3,
  text: `${FIREBENDING_TEXT}\n${EXILE_TEXT}\n${CAST_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { subtype: "Ally", controlledBy: "you" }, includeSelf: true },
      },
      targets: [{ kind: "card-in-graveyard" }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    firebending(1, FIREBENDING_TEXT),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", spell: { subtype: "Ally", ownedBy: "you" } },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
