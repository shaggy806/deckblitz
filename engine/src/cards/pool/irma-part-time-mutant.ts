import { defineCard } from "../define.js";

// EDHREC rank 3446.
//
// The copy has no duration (rule 611.2a). Irma copies the target's copiable
// values — what it copies, if it's a copy — not its counters, status or
// attachments, and, already on the battlefield, no "enters" ability of it
// applies (rule 707.4, the rulings). Her name and this ability are copiable
// exceptions (rule 707.9a-b). With no target chosen she only gets the
// counter; a target chosen that's illegal as it resolves stops all of it
// (rule 608.2b).
const TEXT =
  "At the beginning of combat on your turn, Irma becomes a copy of up to one other target creature you control, except her name is Irma, Part-Time Mutant and she has this ability. Then put a +1/+1 counter on her.";

export default defineCard({
  name: "Irma, Part-Time Mutant",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mutant", "Shapeshifter"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "become-copy",
            target: "source",
            of: 0,
            exceptions: {
              name: "Irma, Part-Time Mutant",
              thisAbility: { card: "Irma, Part-Time Mutant", triggered: 0 },
            },
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
