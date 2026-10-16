import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 12578.
// Eerie works only from the graveyard ("return this card from your
// graveyard"): Bloodghast's shape, Centaur Vinecrasher's return.
const BLOCK = "This creature can't block.";
const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, you may return this card from your graveyard to your hand.";

const RETURN: EffectSpec = {
  kind: "may",
  prompt: "Return Fear of Infinity from your graveyard to your hand?",
  effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
};

export default defineCard({
  name: "Fear of Infinity",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${BLOCK}\n${EERIE}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: BLOCK }],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: RETURN,
      resolve: null,
      text: EERIE,
    },
    {
      fromGraveyard: true,
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: [],
      effect: RETURN,
      resolve: null,
      text: EERIE,
    },
  ],
});
