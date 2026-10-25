import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 29994.
//
// Venom's two trigger events as one ability (`sameAbilityAs`): "blocks a
// white creature" asks the creature it blocks (`object: "blocked"`) as the
// block is declared; "becomes blocked by a white creature" fires once per
// such blocker.

const TEXT =
  "Whenever this creature blocks or becomes blocked by a white creature, this creature gains first strike until end of turn.";
const FIRST_STRIKE = { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" } as const;

export default defineCard({
  name: "Ghost Hounds",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dog", "Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { colors: ["W"] } },
      targets: [],
      effect: FIRST_STRIKE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: { colors: ["W"] } },
      sameAbilityAs: 0,
      targets: [],
      effect: FIRST_STRIKE,
      resolve: null,
      text: TEXT,
    },
  ],
});
