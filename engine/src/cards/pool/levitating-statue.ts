import { defineCard } from "../define.js";

// EDHREC rank 17907. The Brothers' War.

const CAST_TEXT = "Whenever you cast a noncreature spell, put a +1/+1 counter on this artifact.";
const ANIMATE_TEXT = "{2}: This artifact becomes a 1/1 Construct artifact creature until end of turn.";

export default defineCard({
  name: "Levitating Statue",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      // Iron Suitcase's shape. Its +1/+1 counters apply on top of the base
      // 1/1 (layer 7c over 7b).
      effect: {
        kind: "animate",
        target: "source",
        power: 1,
        toughness: 1,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Construct"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
