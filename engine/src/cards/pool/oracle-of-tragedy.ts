import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 16810.
//
// One modal trigger per event, its mode announced as it goes on the stack
// (rule 700.2b). The shuffle is Cathartic Parting's: the targeted cards go
// into the library together, then it's shuffled — even with none targeted
// (rule 701.24), but not if every chosen target has become illegal (608.2b).

const TRIGGER_TEXT = "When this creature enters or dies, choose one —";
const LOOT_TEXT = "Draw a card, then discard a card.";
const SHUFFLE_TEXT =
  "Shuffle up to four target cards with mana value 3 or greater from your graveyard into your library.";

const CHOOSE: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: 1,
  modes: [
    {
      text: LOOT_TEXT,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
    },
    {
      text: SHUFFLE_TEXT,
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { manaValue: { op: "gte", n: 3 } } },
          max: 4,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "put-on-library", target: 0, position: "top" },
          },
          { kind: "shuffle-library" },
        ],
      },
    },
  ],
};

export default defineCard({
  name: "Oracle of Tragedy",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n• ${LOOT_TEXT}\n• ${SHUFFLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: CHOOSE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: CHOOSE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
