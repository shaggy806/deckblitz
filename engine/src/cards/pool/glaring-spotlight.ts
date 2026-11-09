import { defineCard } from "../define.js";

export default defineCard({
  name: "Glaring Spotlight",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "Creatures your opponents control with hexproof can be the targets of spells and abilities you control as though they didn't have hexproof.\n{3}, Sacrifice this artifact: Creatures you control gain hexproof until end of turn and can't be blocked this turn.",
  static: [
    {
      affects: { scope: "self" },
      targetsIgnoringHexproof: { object: { type: "creature", controlledBy: "opponent" } },
      text: "Creatures your opponents control with hexproof can be the targets of spells and abilities you control as though they didn't have hexproof.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "hexproof", duration: "end-of-turn" },
          { kind: "restrict", filter: { type: "creature", controlledBy: "you" }, restrictions: ["cant-be-blocked"], asItResolves: true },
        ],
      },
      resolve: null,
      text: "{3}, Sacrifice this artifact: Creatures you control gain hexproof until end of turn and can't be blocked this turn.",
    },
  ],
});
