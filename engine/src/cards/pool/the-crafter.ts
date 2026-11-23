import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// Playtest card (Mystery Booster 2). The scrap tokens are Farid's Scrap: a
// colorless artifact named Scrap with no abilities.

const SACRIFICE =
  '{T}, Sacrifice an artifact: Create an equipment token named Bling with "Equipped creature gets +1/+0" and "Equip {1}."';

export default defineCard({
  name: "The Crafter",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human"],
  power: 3,
  toughness: 4,
  selfCostReduction: affinity({ type: "artifact" }),
  text: `Affinity for artifacts\nWhen The Crafter enters the battlefield, create two colorless scrap artifact tokens. (They have no abilities.)\n${SACRIFICE}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "create-token", token: "Bling Token", count: 1 },
      resolve: null,
      text: SACRIFICE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Scrap Token", count: 2 },
      resolve: null,
      text: "When The Crafter enters the battlefield, create two colorless scrap artifact tokens.",
    },
  ],
});
