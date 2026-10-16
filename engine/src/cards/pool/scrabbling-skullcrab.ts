import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 11431.
const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, target player mills two cards. (They put the top two cards of their library into their graveyard.)";

const MILL: EffectSpec = { kind: "mill", target: 0, amount: 2 };

export default defineCard({
  name: "Scrabbling Skullcrab",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab", "Skeleton"],
  power: 0,
  toughness: 3,
  text: EERIE,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["player"],
      effect: MILL,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: ["player"],
      effect: MILL,
      resolve: null,
      text: EERIE,
    },
  ],
});
