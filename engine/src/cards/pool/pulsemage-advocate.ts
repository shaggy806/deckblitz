import { defineCard } from "../define.js";

const ADVOCATE_TEXT =
  "{T}: Return three target cards from an opponent's graveyard to their hand. Return target creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Pulsemage Advocate",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: ADVOCATE_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      // The group is the last slot, so your creature card comes first.
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "opponent" },
          min: 3,
          max: 3,
          sameController: true,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 1,
            simultaneous: true,
            effect: { kind: "return-to-hand", target: 1, from: "graveyard" },
          },
          { kind: "put-onto-battlefield", target: 0 },
        ],
      },
      resolve: null,
      text: ADVOCATE_TEXT,
    },
  ],
});
