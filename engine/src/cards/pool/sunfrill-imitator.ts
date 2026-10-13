import { defineCard } from "../define.js";

// EDHREC rank 3826.
//
// The copy has no duration (rule 611.2a). It copies the Dinosaur's copiable
// values — what it copies, if it's a copy; a token's as the effect that made
// it said, without becoming a token — not its counters, status or the
// effects on it, and it's still attacking (rule 707.4). Its name and this
// ability are copiable exceptions (rule 707.9a-b): legendary if the Dinosaur
// is, but named Sunfrill Imitator, so the legend rule leaves both (the
// ruling).
const TEXT =
  "Whenever this creature attacks, you may have it become a copy of another target Dinosaur you control, except its name is Sunfrill Imitator and it has this ability.";

export default defineCard({
  name: "Sunfrill Imitator",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Dinosaur" } } }],
      effect: {
        kind: "may",
        prompt: "Have Sunfrill Imitator become a copy of that Dinosaur?",
        effect: {
          kind: "become-copy",
          target: "source",
          of: 0,
          exceptions: {
            name: "Sunfrill Imitator",
            thisAbility: { card: "Sunfrill Imitator", triggered: 0 },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
