import { defineCard } from "../define.js";

// "Other creatures" is other than the enchanted creature.
const PUMP_TEXT = "Enchanted creature gets +1/+1 for each +1/+1 counter on other creatures you control.";
const GRANT_TEXT = 'Enchanted creature has vigilance and "{W}, {T}: Bolster 1."';

export default defineCard({
  name: "Gleam of Authority",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${GRANT_TEXT} (To bolster 1, choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        countersAmong: { counter: "+1/+1", filter: { type: "creature", controlledBy: "you" } },
        relativeToAffected: true,
        excludeSelf: true,
        pt: [1, 1],
      },
      text: PUMP_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantKeywords: ["vigilance"],
      grantsActivated: [
        {
          cost: { mana: "{W}", tap: true },
          targets: [],
          effect: { kind: "bolster", amount: 1 },
          resolve: null,
          text: "{W}, {T}: Bolster 1.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
