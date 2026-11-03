import { defineCard } from "../define.js";

const TEXT =
  "Whenever enchanted creature attacks and isn't blocked, its controller may have it deal damage equal to its power plus 2 to another target creature. If that player does, the attacking creature assigns no combat damage this turn.";

// The Aura's controller controls the ability and chooses the target (rule
// 603.3d); the may is the enchanted creature's controller's, who needn't be the
// same player: `who: "trigger-controller"`.
export default defineCard({
  name: "Farrel's Mantle",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "attached" },
      targets: [{ kind: "other", of: "creature", than: "host" }],
      effect: {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt:
          "Have the enchanted creature deal damage equal to its power plus 2 to the targeted creature? It then assigns no combat damage.",
        effect: {
          kind: "damage",
          amount: { sum: [{ powerOf: "trigger-object" }, 2] },
          target: 0,
          from: "trigger-object",
        },
        ifDid: { kind: "assigns-no-combat-damage", target: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
