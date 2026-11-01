import { defineCard } from "../define.js";

// EDHREC rank 18839. "Another creature or an artifact": the "another" is the
// creature branch's alone, so this creature can't pay as a creature, but
// would as an artifact if it became one (`isSource: false` on one `anyOf`
// branch, matched against the source; `otherOnly` would keep it out of
// both).

const TEXT = "Mold Harvest — {1}, Sacrifice another creature or an artifact: Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Mold Folk",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: false,
        sacrifice: { filter: { anyOf: [{ type: "creature", isSource: false }, { type: "artifact" }] } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
