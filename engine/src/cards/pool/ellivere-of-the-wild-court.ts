import { defineCard } from "../define.js";

// EDHREC rank 6507.
//
// One ability with two trigger events (`sameAbilityAs`). "An enchanted
// creature you control" is any Aura on it, whoever controls the Aura.
const ROLE_TEXT =
  "Whenever Ellivere enters or attacks, create a Virtuous Role token attached to another target creature you control.";
const DRAW_TEXT = "Whenever an enchanted creature you control deals combat damage to a player, draw a card.";
const ROLE = { kind: "create-token", token: "Virtuous Role Token", count: 1, attachedTo: 0 } as const;

export default defineCard({
  name: "Ellivere of the Wild Court",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  text: `${ROLE_TEXT} (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1 for each enchantment you control.)\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: ROLE,
      resolve: null,
      text: ROLE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: ROLE,
      resolve: null,
      text: ROLE_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature", enchanted: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
