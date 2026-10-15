import { defineCard } from "../define.js";

// EDHREC rank 22613.
//
// The bounce is "up to one other target artifact or creature", anyone's.
// The pump is Edgar, Ancient Bloodlord's shape with haste added.

const ENTER_TEXT = "When Metalhead enters, return up to one other target artifact or creature to its owner's hand.";
const PUMP_TEXT =
  "{R}, Sacrifice another artifact: Put a +1/+1 counter on Metalhead. He gains menace and haste until end of turn.";

export default defineCard({
  name: "Metalhead",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Turtle"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
