import { defineCard } from "../define.js";

// EDHREC rank 25361.

const PUMP_TEXT =
  "{R}: This creature gets +1/+0 until end of turn. If it's an Aura, enchanted creature gets +1/+0 until end of turn instead.";

export default defineCard({
  name: "Everflame Eidolon",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  bestow: "{2}{R}",
  text: `Bestow {2}{R} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${PUMP_TEXT}\nEnchanted creature gets +1/+1.`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      // Read as it resolves (ruling): an Aura pumps the creature it enchants,
      // and that bonus stays there even if this becomes a creature later.
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Aura" } },
        then: { kind: "modify-pt", target: "attached", power: 1, toughness: 0, duration: "end-of-turn" },
        else: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});
