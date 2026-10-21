import { defineCard } from "../define.js";

// Hexproof from blue (rule 702.11d) — targeting only, from opponents.

const DAMAGE_TEXT =
  "Whenever this creature is dealt damage, you gain 1 life and create a 1/1 green Saproling creature token.";

export default defineCard({
  name: "Sporeweb Weaver",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 1,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach, hexproof from blue\n${DAMAGE_TEXT}`,
  static: [{ affects: { scope: "self" }, hexproofFrom: { colors: ["U"] }, text: "Hexproof from blue" }],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "create-token", token: "Saproling Token", count: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
