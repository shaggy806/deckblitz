import { defineCard } from "../define.js";

// "Return this card": the Aura card, gone to its owner's graveyard by the
// time the trigger resolves (state-based action, rule 704.5m), returned as
// its back face, the Curse, attached to the target opponent (rule 712.14).

const PUMP_TEXT = "Enchanted creature gets +1/+0 and has vigilance.";
const DIES_TEXT =
  "When enchanted creature dies, return this card to the battlefield transformed under your control attached to target opponent.";

export default defineCard({
  name: "Radiant Grace",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature"],
  text: `Enchant creature\n${PUMP_TEXT}\n${DIES_TEXT}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], grantKeywords: ["vigilance"], text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: ["opponent"],
      effect: { kind: "put-onto-battlefield", target: "source", transformed: true, underYourControl: true, attachedTo: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Radiant Grace", "Radiant Restraints"],
  transform: true,
});
