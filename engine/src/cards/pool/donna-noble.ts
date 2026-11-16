import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// Doctor Who. EDHREC rank 11101.
//
// "A creature it's paired with" is read as the damage is dealt (rule
// 702.95b): both still on the battlefield then, even if it was lethal (the
// ruling). Each permanent dealt damage is its own trigger, so Donna and her
// partner dealt damage at once trigger it twice (the ruling). Donna deals the
// damage, as she last existed if she has left.
const DAMAGE_TEXT =
  "Whenever Donna Noble or a creature it's paired with is dealt damage, Donna Noble deals that much damage to target opponent.";

export default defineCard({
  name: "Donna Noble",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 4,
  pairing: { kind: "doctors-companion" },
  text: `Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\n${DAMAGE_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    ...soulbond(),
    {
      trigger: { on: "dealt-damage", who: "any", filter: { anyOf: [{ isSource: true }, { pairedWithSource: true }] } },
      targets: ["opponent"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
