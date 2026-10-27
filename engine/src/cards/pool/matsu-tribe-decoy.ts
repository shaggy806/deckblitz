import { defineCard } from "../define.js";

// EDHREC rank 26739. Rampant Elephant's lure and
// Kashi-Tribe Elite's combat-damage tap.

const LURE = "{2}{G}: Target creature blocks this creature this turn if able.";
const TAP =
  "Whenever this creature deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Matsu-Tribe Decoy",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 1,
  toughness: 3,
  text: `${LURE}\n${TAP}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0, attacker: "source" },
      resolve: null,
      text: LURE,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "tap", target: "trigger-recipient", doesntUntapNext: true },
      resolve: null,
      text: TAP,
    },
  ],
});
