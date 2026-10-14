import { defineCard } from "../define.js";

const COPY_MODE =
  "+ {1} — Copy target instant spell, sorcery spell, activated ability, or triggered ability. You may choose new targets for the copy.";
const CHANGE_MODE = "+ {1} — Change the target of target spell or ability with a single target.";

// Spree (rule 702.172a). The copy mode's slot takes a spell or an ability;
// `copy-spell` copies an ability as `copy-ability` does. See Bolt Bend for
// the second mode.
export default defineCard({
  name: "Return the Favor",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Spree (Choose one or more additional costs.)\n${COPY_MODE}\n${CHANGE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: COPY_MODE,
        spreeCost: "{1}",
        targets: [{ kind: "stack", spells: "instant-or-sorcery", abilities: true }],
        effect: { kind: "copy-spell", target: 0, newTargets: true },
      },
      {
        text: CHANGE_MODE,
        spreeCost: "{1}",
        targets: [{ kind: "stack", spells: "any", abilities: true, singleTarget: true }],
        effect: { kind: "change-targets", target: 0, how: "change" },
      },
    ],
  },
});
