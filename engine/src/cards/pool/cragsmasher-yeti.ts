import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 22238.
//
// Backup grants only what's printed below it — trample, not mountaincycling,
// which is printed above the backup line (rule 702.165a). On the Yeti itself
// it's just the counters (the rulings).

export default defineCard({
  name: "Cragsmasher Yeti",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "Mountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)\nBackup 2 (When this creature enters, put two +1/+1 counters on target creature. If that's another creature, it gains the following ability until end of turn.)\nTrample",
  triggered: [backup(2, { keywords: ["trample"] })],
});
