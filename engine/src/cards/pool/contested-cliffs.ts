import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] If either target is illegal when the ability resolves, it will do nothing.

const FIGHT_TEXT =
  "{R}{G}, {T}: Target Beast creature you control fights target creature an opponent controls. (Each deals damage equal to its power to the other.)";

export default defineCard({
  name: "Contested Cliffs",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${FIGHT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{R}{G}", tap: true },
      targets: [
        { kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Beast" } },
        "creature-an-opponent-controls",
      ],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: FIGHT_TEXT,
    },
  ],
});
