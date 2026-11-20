import { defineCard } from "../define.js";

const DIST =
  "Distribute three +1/+1 counters among one, two, or three target creatures. For each +1/+1 counter you put on a creature this way, remove a +1/+1 counter from that creature at the beginning of the next cleanup step.";

export default defineCard({
  name: "Bounty of the Hunt",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `You may exile a green card from your hand rather than pay this spell's mana cost.\n${DIST}`,
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["G"] }, text: "a green card" } },
  targets: [{ kind: "any-number", of: "creature", min: 1, max: 3 }],
  divided: { total: 3, slot: 0, of: "+1/+1 counters" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counters-divided", from: 0, counter: "+1/+1" },
      {
        // One delayed ability, a target per counter put on (a creature that
        // has left since is a new object, and loses nothing — 400.7).
        kind: "delayed-trigger",
        at: { step: "cleanup" },
        about: "counters-placed",
        aboutPerCount: true,
        text: "For each +1/+1 counter put on a creature this way, remove a +1/+1 counter from that creature.",
        effect: { kind: "for-each-target", from: 0, effect: { kind: "remove-counter", target: 0, counter: "+1/+1", amount: 1 } },
      },
    ],
  },
});
