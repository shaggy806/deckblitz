import { defineCard } from "../define.js";

// EDHREC rank 9661.
//
// Rulings:
//   The cost reduction reduces only the generic mana in the cost; the colored
//   mana must still be paid. The mana value doesn't change.
//
// Overwhelming Remorse's per-card reduction, twice over; the dies trigger is
// Fell Horseman's, for each creature you control.

const REDUCE_TEXT = "This spell costs {2} less to cast for each creature card in your graveyard.";
const DIES_TEXT = "Whenever a creature you control dies, put it on the bottom of its owner's library.";
const RETURN_TEXT =
  "{2}{B}, {T}, Pay 2 life: Return target creature card from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "The Cauldron of Eternity",
  manaCost: "{10}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${REDUCE_TEXT}\n${DIES_TEXT}\n${RETURN_TEXT}`,
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { product: [{ countInGraveyard: { ownedBy: "you", type: "creature" } }, 2] },
  },
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "put-on-library", target: "trigger-object", position: "bottom" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true, payLife: 2 },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: RETURN_TEXT,
    },
  ],
});
