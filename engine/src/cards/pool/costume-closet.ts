import { defineCard } from "../define.js";

// EDHREC rank 10467.
//
// Rulings:
//   [2025-09-19] If Costume Closet has left the battlefield or has no +1/+1 counters on it by the
//     time its activated ability resolves, you won't put a +1/+1 counter on the target creature.
//     If the creature becomes an illegal target or can't have a +1/+1 counter put onto it for some
//     other reason, you won't remove a +1/+1 counter from Costume Closet.
//   [2025-09-19] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//   [2025-09-19] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2025-09-19] Once Costume Closet runs out of +1/+1 counters, it remains on the battlefield.
//     However, activating its second ability won't do anything.
//   [2025-09-19] The +1/+1 counters on Costume Closet won't affect it unless it somehow becomes a
//     creature.
//   [2025-09-19] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.

export default defineCard({
  name: "Costume Closet",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "This artifact enters with two +1/+1 counters on it.\n{T}: Move a +1/+1 counter from this artifact onto target creature you control. Activate only as a sorcery.\nWhenever a modified creature you control leaves the battlefield, put a +1/+1 counter on this artifact. (Equipment, Auras you control, and counters are modifications.)",
  activated: [
    {
      // A move (rule 122.5): with no +1/+1 counter on it, or it gone, or the
      // target illegal, nothing is removed or put (the ruling).
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "move-counters", from: "source", to: 0, counter: "+1/+1" },
      resolve: null,
      text: "{T}: Move a +1/+1 counter from this artifact onto target creature you control. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      // Modified (rule 700.9) as it last existed on the battlefield.
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { type: "creature", modified: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a modified creature you control leaves the battlefield, put a +1/+1 counter on this artifact.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This artifact enters with two +1/+1 counters on it.",
    },
  ],
});
