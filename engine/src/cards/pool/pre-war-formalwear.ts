import { defineCard } from "../define.js";

// "Attach this Equipment to it": the card the first step put onto the
// battlefield (`target: "put-this-way"`), as the new object it became (rule
// 400.7) — nothing if it didn't arrive, or this Equipment has left.

const ETB =
  "When this Equipment enters, return target creature card with mana value 3 or less from your graveyard to the battlefield and attach this Equipment to it.";

export default defineCard({
  name: "Pre-War Formalwear",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ETB}\nEquipped creature gets +2/+2 and has vigilance.\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "attach", target: "put-this-way" },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["vigilance"],
      text: "Equipped creature gets +2/+2 and has vigilance.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: "Equip {3}",
    },
  ],
});
