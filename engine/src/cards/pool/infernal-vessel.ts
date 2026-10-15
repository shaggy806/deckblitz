import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, if it wasn't a Demon, return it to the battlefield under its owner's control with two +1/+1 counters on it. It's a Demon in addition to its other types.";

export default defineCard({
  name: "Infernal Vessel",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      // Intervening "if" (rule 603.4), read as it last existed on the
      // battlefield (rule 603.10a): a Vessel that came back as a Demon stays dead.
      condition: { kind: "source", filter: { notSubtypes: ["Demon"] } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "+1/+1", amount: 2 },
        addSubtypes: ["Demon"],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
