import { defineCard } from "../define.js";

const TEXT = "{1}{B}: Exile target card from an opponent's graveyard. If no cards are in that graveyard, flip this creature.";

export default defineCard({
  name: "Nezumi Graverobber",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: {
              kind: "amounts",
              left: { countInGraveyard: { ownedBy: "you" }, forPlayer: { ownerOf: 0 } },
              op: "eq",
              right: 0,
            },
            then: { kind: "flip", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Nezumi Graverobber", "Nighteyes the Desecrator"],
  flip: true,
});
