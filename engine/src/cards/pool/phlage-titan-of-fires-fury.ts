import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 8057. Modern Horizons 3.
//
// Uro, Titan of Nature's Wrath's shape. "Unless it escaped" asks how this
// object was cast: from a graveyard under any other permission, or not cast
// at all, it's sacrificed (the ruling). The damage-and-life ability triggers
// on entering either way (the last ruling) and on attacking; it deals the
// damage as Phlage last existed if Phlage is gone, and with its one target
// illegal none of it happens, the life included.

const SAC_TEXT = "When Phlage enters, sacrifice it unless it escaped.";
const BURN_TEXT = "Whenever Phlage enters or attacks, it deals 3 damage to any target and you gain 3 life.";

const BURN: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "damage", amount: 3, target: 0 },
    { kind: "gain-life", amount: 3 },
  ],
};

export default defineCard({
  name: "Phlage, Titan of Fire's Fury",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Giant"],
  power: 6,
  toughness: 6,
  text:
    `${SAC_TEXT}\n${BURN_TEXT}\n` +
    "Escape—{R}{R}{W}{W}, Exile five other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  escape: { cost: "{R}{R}{W}{W}", exileCount: 5 },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { castVia: "escape" } } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: BURN,
      resolve: null,
      text: BURN_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["any-target"],
      effect: BURN,
      resolve: null,
      text: BURN_TEXT,
    },
  ],
});
