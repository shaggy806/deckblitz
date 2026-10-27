import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 24343.
//
// Gift of the Woods' two events on the enchanted creature (`who: "attached"`): the trigger
// object is the enchanted creature either way — the blocker, or the attacker that became blocked.

const TEXT = "Whenever enchanted creature blocks or becomes blocked, you may put a +1/+1 counter on it.";
const EFFECT = {
  kind: "may",
  prompt: "Put a +1/+1 counter on the enchanted creature?",
  effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
} as const;

export default defineCard({
  name: "Ferocity",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    { trigger: { on: "blocks", who: "attached" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "attached" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});
