import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 8676. Long Road Home's delayed
// flicker, as an Arcane instant.
//
// Rulings:
//   [2004-12-01] The creature comes back onto the battlefield as a new creature, with one +1/+1
//     counter on it (plus any other counters that it would normally enter with).
//   [2005-08-01] If Otherworldly Journey is cast during an end step, the creature won't return
//     until the beginning of the next end step.
//   [2005-08-01] Any Aura attached to the creature is put into its owner's graveyard as a
//     state-based action. Equipment attached to the creature become unattached but remain on the
//     battlefield.
const TEXT =
  "Exile target creature. At the beginning of the next end step, return that card to the battlefield under its owner's control with a +1/+1 counter on it.";

export default defineCard({
  name: "Otherworldly Journey",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "flicker",
    target: 0,
    returnAt: "next-end-step",
    thenCounters: { kind: "+1/+1", amount: 1, entering: true },
    returnText: "Return the exiled card to the battlefield under its owner's control with a +1/+1 counter on it.",
  },
});
