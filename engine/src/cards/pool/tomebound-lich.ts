import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 13655. One ability with two trigger events (`sameAbilityAs`).

const TEXT = "Whenever this creature enters or deals combat damage to a player, draw a card, then discard a card.";

const LOOT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "draw", amount: 1 },
    { kind: "discard", target: "you", amount: 1 },
  ],
};

export default defineCard({
  name: "Tomebound Lich",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch", "lifelink"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\nLifelink (Damage dealt by this creature also causes you to gain that much life.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOOT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: LOOT,
      resolve: null,
      text: TEXT,
    },
  ],
});
