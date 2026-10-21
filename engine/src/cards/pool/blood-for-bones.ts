import { defineCard } from "../define.js";

// EDHREC rank 7655.
//
// Neither card is targeted (the ruling): each is chosen as the spell resolves,
// the battlefield one first. The second is "another" card by construction —
// the first has already left the graveyard. The sacrificed creature is in the
// graveyard by then, so it may be either one (the ruling).
//
// Rulings:
//   [2019-07-12] Blood for Bones doesn't target the creature cards to return from your graveyard.
//   [2019-07-12] The creature sacrificed to cast Blood for Bones may be one of the cards chosen to
//     be returned.

export default defineCard({
  name: "Blood for Bones",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nReturn a creature card from your graveyard to the battlefield, then return another creature card from your graveyard to your hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: 1 },
      { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "hand", count: 1 },
    ],
  },
});
