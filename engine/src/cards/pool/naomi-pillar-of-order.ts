import { defineCard } from "../define.js";

// EDHREC rank 20405.
//
// Rulings:
//   [2022-02-18] The artifact and the enchantment may be the same permanent.
//   [2022-02-18] If you don't control both an artifact and an enchantment at the moment Naomi,
//     Pillar of Order enters the battlefield or attacks, its ability won't trigger at all. If the
//     ability triggers, it will check again as it tries to resolve. If you don't control both at
//     that time, the ability won't do anything.
//
// The intervening-if is two `controls` checks, so one artifact enchantment
// satisfies both (the first ruling).
const TEXT =
  "Whenever Naomi enters or attacks, if you control an artifact and an enchantment, create a 2/2 white Samurai creature token with vigilance.";
const CONDITION = {
  kind: "all",
  of: [
    { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
    { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
  ],
} as const;

export default defineCard({
  name: "Naomi, Pillar of Order",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: CONDITION,
      targets: [],
      effect: { kind: "create-token", token: "Samurai Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      condition: CONDITION,
      targets: [],
      effect: { kind: "create-token", token: "Samurai Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
