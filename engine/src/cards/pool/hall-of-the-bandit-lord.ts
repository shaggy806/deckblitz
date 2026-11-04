import { defineCard } from "../define.js";

// The haste lasts: "it gains haste" names no duration (the ruling), so it's for
// as long as the spell and the permanent it becomes last.

const TEXT = "{T}, Pay 3 life: Add {C}. If that mana is spent on a creature spell, it gains haste.";

export default defineCard({
  name: "Hall of the Bandit Lord",
  supertypes: ["legendary"],
  types: ["land"],
  text: `Hall of the Bandit Lord enters tapped.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Hall of the Bandit Lord enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 3 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spellGains: { spell: { type: "creature" }, keywords: ["haste"], lasting: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
