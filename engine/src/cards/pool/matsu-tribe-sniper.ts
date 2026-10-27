import { defineCard } from "../define.js";

// EDHREC rank 18068.

export default defineCard({
  name: "Matsu-Tribe Sniper",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior", "Archer"],
  power: 1,
  toughness: 1,
  text: "{T}: This creature deals 1 damage to target creature with flying.\nWhenever this creature deals damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to target creature with flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature" },
      targets: [],
      effect: { kind: "tap", target: "trigger-recipient", doesntUntapNext: true },
      resolve: null,
      text: "Whenever this creature deals damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
    },
  ],
});
