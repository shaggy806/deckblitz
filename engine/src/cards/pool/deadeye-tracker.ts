import { defineCard } from "../define.js";

// EDHREC rank 13891.

export default defineCard({
  name: "Deadeye Tracker",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 1,
  toughness: 1,
  text: "{1}{B}, {T}: Exile two target cards from an opponent's graveyard. This creature explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "opponent" },
          min: 2,
          max: 2,
          sameController: true,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "exile", target: 0 },
          },
          { kind: "explore", target: "source" },
        ],
      },
      resolve: null,
      text: "{1}{B}, {T}: Exile two target cards from an opponent's graveyard. This creature explores.",
    },
  ],
});
