import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever equipped creature attacks, put a +1/+1 counter on it and tap up to one target creature defending player controls.";

export default defineCard({
  name: "Greatsword of Tyr",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACK_TEXT}\nEquip {W}`,
  triggered: [
    {
      // The attacker is the trigger object; its defending player the trigger player.
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "trigger-player", filter: { type: "creature" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "tap", target: 0 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{W}")],
});
