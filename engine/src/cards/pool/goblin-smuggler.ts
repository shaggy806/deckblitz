import { defineCard } from "../define.js";

// EDHREC rank 15050. Any creature, not just yours; the power check is the
// target's legality, so a pumped target fizzles (the ruling).

const TEXT = "{T}: Another target creature with power 2 or less can't be blocked this turn.";

export default defineCard({
  name: "Goblin Smuggler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste (This creature can attack and {T} as soon as it comes under your control.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
