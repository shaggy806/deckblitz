import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 26823.
//
// Chub Toad's two events on the enchanted creature (`who: "attached"`): the
// trigger object is the enchanted creature either way — the blocker, or the
// attacker that became blocked. A creature never both blocks and becomes
// blocked in one combat.

const TEXT = "Whenever enchanted creature blocks or becomes blocked, it gets +0/+3 until end of turn and you gain 1 life.";
const EFFECT = {
  kind: "sequence",
  effects: [
    { kind: "modify-pt", target: "trigger-object", power: 0, toughness: 3, duration: "end-of-turn" },
    { kind: "gain-life", amount: 1 },
  ],
} as const;

export default defineCard({
  name: "Gift of the Woods",
  manaCost: "{G}",
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
