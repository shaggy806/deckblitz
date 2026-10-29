import { defineCard } from "../define.js";

const ADVOCATE_TEXT =
  "{T}: Return two target cards from an opponent's graveyard to their hand. Destroy target artifact or enchantment.";

export default defineCard({
  name: "Nullmage Advocate",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 2,
  toughness: 3,
  text: ADVOCATE_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      // The group is the last slot, so the artifact or enchantment comes first.
      targets: [
        "artifact-or-enchantment",
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
            from: 1,
            simultaneous: true,
            effect: { kind: "return-to-hand", target: 1, from: "graveyard" },
          },
          { kind: "destroy", target: 0 },
        ],
      },
      resolve: null,
      text: ADVOCATE_TEXT,
    },
  ],
});
