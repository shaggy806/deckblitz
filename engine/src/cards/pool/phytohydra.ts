import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 13591. Lichenthrope's damage
// replacement with +1/+1 counters: the damage becomes the counters
// (`instead: { effect }`, rules 614.1a, 614.6), so nothing that triggers on
// damage sees any, and it isn't prevention, so damage that can't be prevented
// (615.12) is replaced all the same (the third ruling). First-strike damage is
// its own event, so the counters land before Phytohydra's own regular damage
// (the ruling).
const TEXT = "If damage would be dealt to this creature, put that many +1/+1 counters on it instead.";

export default defineCard({
  name: "Phytohydra",
  manaCost: "{2}{G}{W}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Plant", "Hydra"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" } },
        to: "self",
      },
      text: TEXT,
    },
  ],
});
