import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 13591. Lichenthrope's damage
// replacement with +1/+1 counters (Anti-Venom's shape): no damage is dealt,
// so nothing that triggers on damage sees any, and `perEvent` puts one batch
// for a simultaneous event — "that many" its total. First-strike damage is
// its own event, so the counters land before Phytohydra's own regular damage
// (the ruling). The engine has no "damage can't be prevented" effect, the one
// place this replacement and a prevention would part (the third ruling).
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
        prevent: true,
        perEvent: true,
        to: "self",
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
      },
      text: TEXT,
    },
  ],
});
