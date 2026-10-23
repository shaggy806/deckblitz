import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 10186.
//
// "You may exile …. If you do, this creature becomes a copy of that
// creature until end of turn": a `may` whose `then` is the copy, read off the
// exiled creature as it last existed on the battlefield (rule 608.2h) — its
// copiable values, never its counters or other effects (the rulings). The
// return is the flicker's own delayed trigger, linked to the exile, so it
// happens whatever becomes of this creature; it stays a copy through that end
// step (the copy ends at cleanup).
const TEXT =
  "Whenever this creature attacks, you may exile another target nontoken creature. If you do, this creature becomes a copy of that creature until end of turn. Return the exiled card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Identity Thief",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", token: false } } }],
      effect: {
        kind: "may",
        prompt: "Exile that creature? This creature becomes a copy of it until end of turn.",
        effect: {
          kind: "flicker",
          target: 0,
          returnAt: "next-end-step",
          returnText: "Return the exiled card to the battlefield under its owner's control.",
        },
        then: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
