import { defineCard } from "../define.js";

// EDHREC rank 12403. "When you do" waits on the exile; X is the exiled card's
// toughness, fixed as the reflexive ability is put on the stack.

const ACTIVATE_TEXT =
  "{3}: Exile target creature card from a graveyard. When you do, put X +1/+1 counters on target Symbiote, where X is the exiled card's toughness.";

export default defineCard({
  name: "Venom, Deadly Devourer",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Symbiote", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance", "menace"],
  text: `Vigilance, menace\n${ACTIVATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "permanent", filter: { subtype: "Symbiote" } }],
              value: { toughnessOf: 0 },
              effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { triggerValue: true } },
              text: "When you do, put X +1/+1 counters on target Symbiote, where X is the exiled card's toughness.",
            },
          },
        ],
      },
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
});
