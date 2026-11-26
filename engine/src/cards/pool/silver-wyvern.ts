import { defineCard } from "../define.js";

// A spell or ability whose every target is this creature (`targeting: { only,
// source }`); its new target must be a creature (`newTargetIs`) legal for it
// (rule 115.7a, the ruling). With none, the target stays.

const REDIRECT =
  "{U}: Change the target of target spell or ability that targets only this creature. The new target must be a creature.";

export default defineCard({
  name: "Silver Wyvern",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${REDIRECT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [{ kind: "stack", spells: "any", abilities: true, targeting: { only: true, source: true } }],
      effect: { kind: "change-targets", target: 0, how: "change", newTargetIs: { type: "creature" } },
      resolve: null,
      text: REDIRECT,
    },
  ],
});
