import { defineCard } from "../define.js";

// EDHREC rank 22280.
//
// Rulings:
//   Eye for an Eye must resolve before damage would be dealt to you in order
//     to affect that damage.
//   The damage dealt to you is still being dealt by the original source. The
//     damage dealt to the other player is being dealt by Eye for an Eye.
//
// Not prevention: a replacement (rule 614.1a) that lets the damage through
// and adds Eye for an Eye's own beside it (`also`), so it works on damage
// that can't be prevented, and "that much" is the damage as it stood when it
// applied (the player dealt it orders it among the others, 616.1).

const TEXT =
  "The next time a source of your choice would deal damage to you this turn, instead that source deals that much damage to you and Eye for an Eye deals that much damage to that source's controller.";

export default defineCard({
  name: "Eye for an Eye",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "prevent-damage-from-chosen-source",
    to: "you",
    amount: "next-time",
    also: { kind: "damage", amount: "x", who: "trigger-controller" },
  },
});
