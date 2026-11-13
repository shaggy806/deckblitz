import { defineCard } from "../define.js";

// EDHREC rank 19400. Mercadian Masques. "Spell or ability that targets a
// creature": a stack target narrowed by what it targets now (Teferi's Response).
const TEXT = "{U}, {T}, Discard a card: Counter target spell or ability that targets a creature.";

export default defineCard({
  name: "Diplomatic Escort",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "stack", spells: "any", abilities: true, targeting: { permanent: { type: "creature" } } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
