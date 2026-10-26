import { defineCard } from "../define.js";

// The intervening "if" reads the source as it last existed once it has left,
// so the trigger still resolves with Polis Crusher gone (the ruling).
const MONSTROSITY_TEXT =
  "{4}{R}{G}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, if this creature is monstrous, destroy target enchantment that player controls.";

export default defineCard({
  name: "Polis Crusher",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample, protection from enchantments\n${MONSTROSITY_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { types: ["enchantment"] },
      text: "Protection from enchantments",
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{R}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "enchantment" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
