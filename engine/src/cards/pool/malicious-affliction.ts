import { defineCard } from "../define.js";

// EDHREC rank 8999.
//
// Morbid's cast trigger is an intervening if (rule 603.4): checked as the
// spell is cast and again as the trigger resolves. The copy keeps the
// original's target unless its controller picks a new one (the ruling), and
// isn't cast, so it doesn't trigger morbid again.

const MORBID_TEXT =
  "Morbid — When you cast this spell, if a creature died this turn, you may copy Malicious Affliction and may choose a new target for the copy.";

export default defineCard({
  name: "Malicious Affliction",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `${MORBID_TEXT}\nDestroy target nonblack creature.`,
  targets: ["nonblack-creature"],
  effect: { kind: "destroy", target: 0 },
  triggered: [
    {
      trigger: { on: "this-cast" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy Malicious Affliction? (You may choose a new target for the copy.)",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: MORBID_TEXT,
    },
  ],
});
