import { defineCard } from "../define.js";

export default defineCard({
  name: "Nahiri's Machinations",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "At the beginning of combat on your turn, target creature you control gains indestructible until end of turn.\n{1}{R}: This enchantment deals 1 damage to target blocking creature.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}{R}: This enchantment deals 1 damage to target blocking creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: "At the beginning of combat on your turn, target creature you control gains indestructible until end of turn.",
    },
  ],
});
