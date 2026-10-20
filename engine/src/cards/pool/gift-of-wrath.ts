import { defineCard } from "../define.js";

// EDHREC rank 19151.
// Makes Spirit → use "2/2 Red Spirit Token".
//
// The bonus and menace apply only while the enchanted permanent is a creature
// (Born to Drive's gate). The token comes however the Aura leaves.
const CREATURE_TEXT = "As long as enchanted permanent is a creature, it gets +2/+2 and has menace.";
const LEAVES_TEXT = "When this Aura leaves the battlefield, create a 2/2 red Spirit creature token with menace.";

export default defineCard({
  name: "Gift of Wrath",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${CREATURE_TEXT} (It can't be blocked except by two or more creatures.)\n${LEAVES_TEXT}`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [2, 2],
      grantKeywords: ["menace"],
      text: CREATURE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Red Spirit Token", count: 1 },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
