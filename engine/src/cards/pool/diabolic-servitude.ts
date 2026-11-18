import { defineCard } from "../define.js";

// Urza's Destiny (UDS). EDHREC rank 15407.
//
// Rulings:
//   If the creature is on the battlefield and is returned to its owner's hand or is exiled, this
//     card loses track of the creature and has no further effects in the future.
//
// "The creature put onto the battlefield with this enchantment" is linked to the enters trigger
// that put it there (rule 607.2c): the dies trigger's filter is `putThereBySource: { triggered: 0
// }`, and the leaves trigger exiles `{ putOntoBattlefieldWith: { triggered: 0 } }` — in the stint
// of this enchantment that just left, so only a creature still on the battlefield from that return
// (one that left meanwhile is a new object, rule 400.7, as the ruling says). "Exile it" finds the
// creature card in the graveyard it died into (400.7e). Destroyed beside the creature, this
// enchantment still sees it die (603.10a) and exiles it, but is a new object in its graveyard by
// then and stays there.
const RETURN_TEXT = "When this enchantment enters, return target creature card from your graveyard to the battlefield.";
const DIES_TEXT =
  "When the creature put onto the battlefield with this enchantment dies, exile it and return this enchantment to its owner's hand.";
const LEAVES_TEXT =
  "When this enchantment leaves the battlefield, exile the creature put onto the battlefield with this enchantment.";

export default defineCard({
  name: "Diabolic Servitude",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${RETURN_TEXT}\n${DIES_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { putThereBySource: { triggered: 0 } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "return-to-hand", target: "source" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile", target: { putOntoBattlefieldWith: { triggered: 0 } } },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
