import { defineCard } from "../define.js";

// EDHREC rank 19202. The Brothers' War.

const ENTER_TEXT =
  "When this creature enters, return target artifact or creature card with mana value 3 or less from your graveyard to the battlefield.";
const ANTHEM_TEXT = "Creatures you control with mana value 3 or less get +1/+0.";

export default defineCard({
  name: "Hero of the Dunes",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", manaValue: { op: "lte", n: 3 } },
      },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
});
