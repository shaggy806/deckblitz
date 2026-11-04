import { defineCard } from "../define.js";

// EDHREC rank 1711. The last line's count is each affected creature's own:
// `relativeToAffected` makes its `sameNameAsSource` and `excludeSelf` read that
// creature, and a token copy counts for a nontoken one though it gets no bonus
// (the ruling). A face-down creature has no name, so it shares none (the ruling,
// rule 708.2a).

const LEGEND = 'The "legend rule" doesn\'t apply to permanents you control.';
const LEGENDARY = "Each legendary creature you control gets +1/+1.";
const SAME_NAME =
  "Each nontoken creature you control gets +1/+1 for each other creature you control with the same name as that creature.";

export default defineCard({
  name: "Mirror Box",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${LEGEND}\n${LEGENDARY}\n${SAME_NAME}`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you" } },
      legendRuleOff: true,
      text: LEGEND,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", supertype: "legendary", controlledBy: "you" } },
      grantPt: [1, 1],
      text: LEGENDARY,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", token: false, controlledBy: "you" } },
      grantPtPerCount: {
        filter: { type: "creature", controlledBy: "you", sameNameAsSource: true },
        relativeToAffected: true,
        excludeSelf: true,
        pt: [1, 1],
      },
      text: SAME_NAME,
    },
  ],
});
