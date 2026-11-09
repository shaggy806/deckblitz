import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

export default defineCard({
  name: "Detection Tower",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}, {T}: Until end of turn, your opponents and creatures your opponents control with hexproof can be the targets of spells and abilities you control as though they didn't have hexproof.",
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "timed-static",
        duration: "end-of-turn",
        text: "Until end of turn, your opponents and creatures your opponents control with hexproof can be the targets of spells and abilities you control as though they didn't have hexproof.",
        static: [
          {
            affects: { scope: "self" },
            targetsIgnoringHexproof: { object: { type: "creature", controlledBy: "opponent" }, players: "opponents" },
            text: "As though they didn't have hexproof.",
          },
        ],
      },
      resolve: null,
      text: "{1}, {T}: Until end of turn, your opponents and creatures your opponents control with hexproof can be the targets of spells and abilities you control as though they didn't have hexproof.",
    },
  ],
});
