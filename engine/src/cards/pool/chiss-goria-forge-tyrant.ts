import { defineCard } from "../define.js";

// One artifact spell from among the five (`upTo: 1` shared by them all), this
// turn, for its cost; cast that way it has affinity for artifacts (the
// permission's `affinity`, rule 702.41a).
const ATTACK_TEXT =
  "Whenever Chiss-Goria attacks, exile the top five cards of your library. You may cast an artifact spell from " +
  "among them this turn. If you do, it has affinity for artifacts.";

export default defineCard({
  name: "Chiss-Goria, Forge Tyrant",
  manaCost: "{6}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying", "haste"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text:
    "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying, haste\n" +
    ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 5,
        duration: "end-of-turn",
        spell: { type: "artifact" },
        upTo: 1,
        affinity: { type: "artifact" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
