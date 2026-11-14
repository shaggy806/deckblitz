import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// "Its power" is Neerdiv's as the ability resolves, or as it last existed
// (rule 608.2h). "Whenever you cast a spell from your graveyard or activate
// an ability of a card in your graveyard" is two triggers sharing one text: a
// spell cast from your graveyard (a card in a graveyard is its owner's), and
// an ability activated from there (`sourceZone`) — an unearth, an embalm, a
// scavenge — read where the card was as it was activated, however its cost
// moved it.

const TAPPED = "Whenever Neerdiv becomes tapped, target player mills cards equal to its power.";
const GRAVEYARD =
  "Whenever you cast a spell from your graveyard or activate an ability of a card in your graveyard, draw a card and put a +1/+1 counter on Neerdiv.";

const reward: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "draw", amount: 1 },
    { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
  ],
};

export default defineCard({
  name: "Neerdiv, Devious Diver",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${TAPPED}\n${GRAVEYARD}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: { powerOf: "source" } },
      resolve: null,
      text: TAPPED,
    },
    {
      trigger: { on: "cast-spell", who: "you", from: "graveyard", filter: { ownedBy: "you" } },
      targets: [],
      effect: reward,
      resolve: null,
      text: GRAVEYARD,
    },
    {
      trigger: { on: "activates-ability", who: "you", sourceZone: "graveyard" },
      targets: [],
      effect: reward,
      resolve: null,
      text: GRAVEYARD,
    },
  ],
});
