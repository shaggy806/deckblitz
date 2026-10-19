import { defineCard } from "../define.js";

// The Brothers' War. Tough Cookie's ability: the artifact keeps its other
// types and subtypes (the ruling).
const ANIMATE_TEXT = "{2}{G}: Until end of turn, target noncreature artifact you control becomes a 4/4 artifact creature.";

export default defineCard({
  name: "Alloy Animist",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: ANIMATE_TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
