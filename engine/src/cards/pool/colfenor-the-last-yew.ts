import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

const DIES_TEXT =
  "Whenever Colfenor or another creature you control dies, return up to one other target creature card with lesser toughness from your graveyard to your hand.";

// "Other": never the card whose death fired this ability (the ruling) — though
// a creature that died beside it may be. "Lesser toughness" reads the dying
// creature as it last existed on the battlefield (the ruling), and the cards
// in the graveyard as they are there.
const LESSER: TargetSpec = {
  kind: "optional",
  of: {
    kind: "other",
    than: "trigger-object",
    of: {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { type: "creature", toughness: { op: "lt", n: { amount: { toughnessOf: "trigger-object" } } } },
    },
  },
};

export default defineCard({
  name: "Colfenor, the Last Yew",
  manaCost: "{3}{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 3,
  toughness: 7,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [LESSER],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [LESSER],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
