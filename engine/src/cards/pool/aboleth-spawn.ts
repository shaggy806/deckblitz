import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// - Only the entering creature's own triggered abilities count, not another
//   permanent's that its entering triggers (ruling): the
//   `entry-triggers-own-ability` event, its `who: "opponent"` the ability's
//   controller — the creature's, as it entered.
// - It triggers once that ability is on the stack, so its copy resolves
//   first (ruling); a modal copy keeps its modes (`copy-ability`).

const TELEPATHY =
  "Probing Telepathy — Whenever a creature entering under an opponent's control causes a triggered ability of that creature to trigger, you may copy that ability. You may choose new targets for the copy.";

export default defineCard({
  name: "Aboleth Spawn",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish", "Horror"],
  power: 2,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\nWard {2}\n${TELEPATHY}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "event", event: "entry-triggers-own-ability", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that ability?",
        effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      },
      resolve: null,
      text: TELEPATHY,
    },
  ],
});
