import { defineCard } from "../define.js";

// EDHREC rank 13003.
//
// Rulings:
//   [2019-10-04] You can activate Wicked Wolf's last ability even if it's already tapped.
//   [2019-10-04] If the target creature is an illegal target when Wicked Wolf's first ability
//     tries to resolve, the ability doesn't resolve. If Wicked Wolf is no longer on the
//     battlefield, the target creature won't deal or be dealt damage.

const ENTER_TEXT = "When this creature enters, it fights up to one target creature you don't control.";
const FOOD_TEXT =
  "Sacrifice a Food: Put a +1/+1 counter on this creature. It gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Wicked Wolf",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${FOOD_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Food" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
