import { defineCard } from "../define.js";

// EDHREC rank 28396.
//
// "Enchant artifact an opponent controls" is Nurgle's Rot's shape: the
// enchant restriction is re-checked as a state-based action (rules 303.4c,
// 704.5m), so the Aura goes if its controller gains control of the
// artifact. A modal triggered ability: its mode, and that mode's target, are
// chosen as it goes on the stack (`announced` — rule 700.2b).
const TRIGGER_TEXT = "Whenever enchanted artifact becomes tapped, choose one —";
const DAMAGE_MODE = "This Aura deals 1 damage to target player or planeswalker.";
const LIFE_MODE = "Target player gains 1 life.";

export default defineCard({
  name: "Relic Bind",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact an opponent controls\n${TRIGGER_TEXT}\n• ${DAMAGE_MODE}\n• ${LIFE_MODE}`,
  targets: ["artifact-an-opponent-controls"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: DAMAGE_MODE,
            targets: ["player-or-planeswalker"],
            effect: { kind: "damage", amount: 1, target: 0 },
          },
          {
            text: LIFE_MODE,
            targets: ["player"],
            effect: { kind: "gain-life", amount: 1, toControllerOfTarget: 0 },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${DAMAGE_MODE} ${LIFE_MODE}`,
    },
  ],
});
