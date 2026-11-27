import { defineCard } from "../define.js";

// EDHREC rank 25968.
//
// The exiled card is read where it is, in exile: its power and toughness
// there (a `*` from a characteristic-defining ability counts in every zone —
// the ruling), fixed as the ability resolves, since an "until end of turn"
// P/T change locks its amount then (rule 611.2c). Not a creature card: no
// bonus.
const TEXT =
  "Whenever this creature attacks, exile the top card of your library. If it's a creature card, this creature gets +X/+Y until end of turn, where X is the exiled creature card's power and Y is its toughness.";

export default defineCard({
  name: "Bioplasm",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: {
              kind: "modify-pt",
              target: "source",
              power: { powerOf: { thisWay: "exiled" } },
              toughness: { toughnessOf: { thisWay: "exiled" } },
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
