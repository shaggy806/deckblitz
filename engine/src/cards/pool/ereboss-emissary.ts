import { defineCard } from "../define.js";

const PUMP_TEXT =
  "Discard a creature card: This creature gets +2/+2 until end of turn. If this permanent is an Aura, enchanted creature gets +2/+2 until end of turn instead.";

export default defineCard({
  name: "Erebos's Emissary",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Snake"],
  power: 3,
  toughness: 3,
  bestow: "{5}{B}",
  text: `Bestow {5}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${PUMP_TEXT}\nEnchanted creature gets +3/+3.`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      // Read as it resolves, like Everflame Eidolon's: an Aura pumps the
      // creature it enchants instead of itself.
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Aura" } },
        then: { kind: "modify-pt", target: "attached", power: 2, toughness: 2, duration: "end-of-turn" },
        else: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
});
