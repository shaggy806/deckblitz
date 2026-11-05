import { CHOSEN_CREATURE_TYPE } from "../../effects.js";
import { defineCard } from "../define.js";

export default defineCard({
  name: "Tsabo's Decree",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose a creature type. Target player reveals their hand and discards all creature cards of that type. Then destroy all creatures of that type that player controls. They can't be regenerated.",
  targets: ["player"],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "sequence",
      effects: [
        {
          kind: "discard-hand",
          who: 0,
          filter: { type: "creature", subtype: CHOSEN_CREATURE_TYPE },
          reveal: true,
        },
        {
          kind: "destroy-all",
          filter: { type: "creature", subtype: CHOSEN_CREATURE_TYPE, controlledBy: "you" },
          controlledByTarget: 0,
          cantBeRegenerated: true,
        },
      ],
    },
  },
});
