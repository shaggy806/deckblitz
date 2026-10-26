import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, that creature loses first strike until end of turn.";
const LOSE = { kind: "lose-keywords", target: "trigger-object", keywords: ["first-strike"], duration: "end-of-turn" } as const;

export default defineCard({
  name: "Talruum Champion",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: LOSE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: LOSE,
      resolve: null,
      text: TEXT,
    },
  ],
});
