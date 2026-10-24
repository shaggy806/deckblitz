import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 9760.
//
// A delayed flicker (Kykar's shape) whose return brings the counter with it
// as it enters (Spaceshift's `thenCounters`). The return is linked to the
// exile, so a token never comes back and a card that left exile in the
// meantime stays where it is; exiled during an end step, it waits for the
// next turn's (the rulings). A double-faced card returns front face up and
// gets the counter even if it isn't a creature.
export default defineCard({
  name: "Long Road Home",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature. At the beginning of the next end step, return that card to the battlefield under its owner's control with a +1/+1 counter on it.",
  targets: ["creature"],
  effect: {
    kind: "flicker",
    target: 0,
    returnAt: "next-end-step",
    thenCounters: { kind: "+1/+1", amount: 1, entering: true },
    returnText: "Return the exiled card to the battlefield under its owner's control with a +1/+1 counter on it.",
  },
});
