import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 21468.
//
// Comeuppance's shape: a `damage-rule` over you and your permanents, by
// sources you don't control, whose additional effect (rule 615.5) is the
// spell's own damage to its one target — not a redirection, and not combat
// damage (the rulings). "You may" is a `may` inside that `then`, asked as the
// damage is prevented, the event waiting on the answer; once for all the
// damage one event had prevented. The target is chosen as the spell is cast
// and isn't checked again after it resolves: one that has left the
// battlefield since is gone (rule 400.7), and nothing is dealt.
//
// Rulings:
//   [2014-11-24] Channel Harm's only target is the creature it may deal damage to. You choose
//     that target as you cast Channel Harm, not at the time it prevents damage.
//   [2014-11-24] Whether the target creature is still a legal target is not checked after
//     Channel Harm resolves. Damage will still be prevented, even if Channel Harm can't deal
//     damage to that creature.

export default defineCard({
  name: "Channel Harm",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to you and permanents you control this turn by sources you don't control. If damage is prevented this way, you may have Channel Harm deal that much damage to target creature.",
  targets: ["creature"],
  effect: {
    kind: "damage-rule",
    to: { players: "you", permanents: { controlledBy: "you" } },
    by: { filter: { controlledBy: "opponent" } },
    then: {
      kind: "may",
      prompt: "Have Channel Harm deal the damage it prevented to its target creature?",
      effect: { kind: "damage", amount: "x", target: 0 },
    },
  },
});
