import { defineCard } from "../define.js";

// The card exiled isn't linked to Lazav (rule 607.2a): this ability has no
// "the exiled card" of its own, so a "return the exiled card" of a creature
// Lazav then copies (Fiend Hunter) never finds it. The copy is of the card as
// printed (the rulings), and keeps Lazav's counters.

const TEXT =
  "Whenever you commit a crime, put a +1/+1 counter on Lazav. Then you may exile a card from a graveyard. If a creature card was exiled this way, you may have Lazav become a copy of that card until end of turn. This ability triggers only once each turn.";

export default defineCard({
  name: "Lazav, Familiar Stranger",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 4,
  text: `${TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  triggered: [
    {
      trigger: { on: "event", event: "commits-crime", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 0,
            max: 1,
            destination: "exile",
            unlinked: true,
            leftover: "stay",
            then: {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
              then: {
                kind: "may",
                prompt: "Have Lazav become a copy of that card until end of turn?",
                effect: { kind: "become-copy", target: "source", of: 0, ofCard: true, until: "end-of-turn" },
              },
            },
          },
        ],
      },
      resolve: null,
      oncePerTurn: true,
      text: TEXT,
    },
  ],
});
