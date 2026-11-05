import { defineCard } from "../define.js";

// EDHREC rank 27341. Imperial Edict's choice, on an enters trigger.
const TEXT = "When this creature enters, target opponent chooses a creature they control. Destroy that creature.";

export default defineCard({
  name: "Wei Assassins",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Assassin"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: { target: 0 },
            for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
          },
          { kind: "for-each-voted", which: "voted", effect: { kind: "destroy", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
