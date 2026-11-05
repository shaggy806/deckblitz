import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const TEXT =
  'Whenever Scriv enters or attacks, create a white Aura enchantment token named Contract attached to target creature an opponent controls. The token has enchant creature and "Whenever enchanted creature attacks, it gets +2/+0 until end of turn if it\'s attacking one of your opponents. Otherwise, its controller loses 2 life."';
const CONTRACT: EffectSpec = { kind: "create-token", token: "Contract Token", count: 1, attachedTo: 0 };

export default defineCard({
  name: "Scriv, the Obligator",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Inkling", "Bird"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: CONTRACT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: CONTRACT,
      resolve: null,
      text: TEXT,
    },
  ],
});
