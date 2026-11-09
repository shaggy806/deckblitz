import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// "Another" is more than the card that just died: a Clone that dies as a copy of
// a smaller flier has a lesser mana value than itself (the card, MV 4) only as a
// card — so the trigger's object is left out by name. The lesser mana value reads
// the dead creature as it last existed (the ruling).
const TEXT =
  "Whenever this creature or another creature you control with flying dies, return another target creature card with lesser mana value from your graveyard to the battlefield.";

const LESSER: TargetSpec = {
  kind: "other",
  of: {
    kind: "card-in-graveyard",
    whose: "you",
    filter: { type: "creature", manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } } },
  },
  than: "trigger-object",
};

export default defineCard({
  name: "Jackdaw Savior",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [LESSER],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", keyword: "flying" }, otherOnly: true },
      targets: [LESSER],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
