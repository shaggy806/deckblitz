import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 13259.
//
// Rulings:
//   [2004-10-04] It untaps during the resolution of its ability.
//   [2007-09-16] You can activate the ability whether or not Eater of the Dead is tapped. However,
//     if Eater of the Dead is untapped when the ability resolves, the ability won't do anything.
//
// "If this creature is tapped" is checked as the ability resolves.

const TEXT = "{0}: If this creature is tapped, exile target creature card from a graveyard and untap this creature.";

export default defineCard({
  name: "Eater of the Dead",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { tapped: true } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            { kind: "untap", target: "source" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
