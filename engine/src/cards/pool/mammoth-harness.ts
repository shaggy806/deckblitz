import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 32016.
//
// Venom's shape (`who: "attached"`, two trigger events as one ability): the
// other creature — the one it blocks, or each one blocking it — is the
// trigger object, and it gains first strike.

const TEXT =
  "Whenever enchanted creature blocks or becomes blocked by a creature, the other creature gains first strike until end of turn.";
const FIRST_STRIKE = {
  kind: "grant-keyword",
  target: "trigger-object",
  keyword: "first-strike",
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Mammoth Harness",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature loses flying.\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      loseKeywords: ["flying"],
      text: "Enchanted creature loses flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "blocks", who: "attached", object: "blocked" },
      targets: [],
      effect: FIRST_STRIKE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: FIRST_STRIKE,
      resolve: null,
      text: TEXT,
    },
  ],
});
