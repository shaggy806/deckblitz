import { defineCard } from "../define.js";

// EDHREC rank 27082.
//
// Imperial Edict's choice, then Mark for Death's rule: a rule for the rest of the
// turn over the chooser's other creatures, so one that enters later can't block
// either (rule 611.2c). With no creature to choose, nothing is restricted.
export default defineCard({
  name: "Goblin War Cry",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target opponent chooses a creature they control. Other creatures they control can't block this turn.",
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
      {
        kind: "for-each-voted",
        which: "voted",
        effect: {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
          exceptTarget: 0,
          restrictions: ["cant-block"],
        },
      },
    ],
  },
});
