import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// Rulings:
//   If a creature on the battlefield or a creature card in a graveyard has {X} in its mana
//   cost, X is considered to be 0.
//   Orah's ability can target a Cleric card that was put into your graveyard at the same
//   time as the Cleric whose death caused the ability to trigger.
//   If another Cleric you control dies at the same time as Orah, Orah's ability triggers
//   for that Cleric in addition to triggering for itself.

const TEXT =
  "Whenever Orah or another Cleric you control dies, return target Cleric card with lesser mana value from your graveyard to the battlefield.";

const LESSER: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { subtype: "Cleric", manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } } },
};

export default defineCard({
  name: "Orah, Skyclave Hierophant",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [LESSER],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Cleric" }, otherOnly: true },
      targets: [LESSER],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
