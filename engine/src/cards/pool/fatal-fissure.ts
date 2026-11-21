import { defineCard } from "../define.js";

// EDHREC rank 17288. "When that creature dies this turn" is a delayed "when"
// watching the target (rule 603.7c), once (603.7b); it chooses its own
// target — the land earthbend animates — as it triggers (603.3d), so its
// effect's slot 0 is that land, not the creature.

const DELAYED_TEXT = "When that creature dies this turn, you earthbend 4.";

export default defineCard({
  name: "Fatal Fissure",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Choose target creature. ${DELAYED_TEXT} (Target land you control becomes a 0/0 creature with haste that's still a land. Put four +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)`,
  targets: ["creature"],
  effect: {
    kind: "delayed-trigger",
    at: {
      whenever: { on: "dies", who: "self" },
      watching: 0,
      once: true,
      targets: ["land-you-control"],
    },
    effect: { kind: "earthbend", target: 0, amount: 4 },
    text: DELAYED_TEXT,
  },
});
