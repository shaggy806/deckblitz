import { defineCard } from "../define.js";

export default defineCard({
  name: "Rashida Scalebane",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  text: "{T}: Destroy target attacking or blocking Dragon. It can't be regenerated. You gain life equal to its power.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "creature", subtype: "Dragon", anyOf: [{ attacking: true }, { blocking: true }] },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0, cantBeRegenerated: true },
          { kind: "gain-life", amount: { powerOf: 0 } },
        ],
      },
      resolve: null,
      text: "{T}: Destroy target attacking or blocking Dragon. It can't be regenerated. You gain life equal to its power.",
    },
  ],
});
