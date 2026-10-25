import { defineCard } from "../define.js";

// EDHREC rank 10186.
//
// The exile and its delayed return are one `flicker` (Kykar's shape); "if
// you do" reads that something was exiled this way, and the copy reads the
// exiled creature as it last existed on the battlefield (rule 608.2h) — its
// copiable values, not counters or other effects (the last ruling).

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
        prompt: "Exile that creature and become a copy of it until end of turn?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "flicker",
              target: 0,
              returnAt: "next-end-step",
              returnText: "Return the exiled card to the battlefield under its owner's control.",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
