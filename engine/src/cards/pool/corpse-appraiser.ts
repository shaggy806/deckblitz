import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Raven Eagle's "if a card is exiled this way" (`this-way` `"exiled"`), so
// no target, an illegal one or a card that never reaches exile looks at
// nothing; then Wail of the Forgotten's look-three, one to hand.
const TEXT =
  "When this creature enters, exile up to one target creature card from a graveyard. If a card is put into exile this way, look at the top three cards of your library, then put one of those cards into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Corpse Appraiser",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", filter: { type: "creature" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "look-and-choose",
              zone: "library",
              count: 3,
              min: 1,
              max: 1,
              destination: "hand",
              leftover: "graveyard",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
