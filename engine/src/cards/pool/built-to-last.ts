import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 19682.
//
// Blacksmith's Skill's shape the other way round: the +2/+2 always, the
// indestructible as well (not instead) if it's an artifact creature as the
// spell resolves (the ruling).
export default defineCard({
  name: "Built to Last",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If it's an artifact creature, it gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { types: ["artifact", "creature"] } },
        then: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      },
    ],
  },
});
