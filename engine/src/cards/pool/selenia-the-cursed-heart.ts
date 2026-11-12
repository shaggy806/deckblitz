import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. The Curse is an Aura token created
// already enchanting the targeted opponent (create-token's `attachedTo` with a
// player in the slot, rule 303.4); an opponent it can't enchant gets none.
const GAIN_TEXT = "If you would gain life, you gain twice that much life instead.";
const DIES_TEXT =
  'When Selenia dies, create a legendary black Aura Curse enchantment token named Selenia\'s Curse attached to target opponent. The token has enchant player and "If enchanted player would lose life, they lose twice that much life instead."';

export default defineCard({
  name: "Selenia, the Cursed Heart",
  manaCost: "{4}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 2,
  toughness: 5,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${GAIN_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", instead: { modify: { times: 2 } } },
      text: GAIN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Selenia's Curse Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
