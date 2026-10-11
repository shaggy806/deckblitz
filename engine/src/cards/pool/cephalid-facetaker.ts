import { defineCard } from "../define.js";

// EDHREC rank 6882.
//
// The copy's exceptions are copiable values (rule 707.9b): base 1/4, and
// "This creature can't be blocked" (the engine's `unblockable`), which the
// copied creature's own abilities don't carry. Until end of turn, as Sarkhan,
// Soul Aflame's and Saheeli, Sublime Artificer's are.

const UNBLOCKABLE_TEXT = "This creature can't be blocked.";
const COPY_TEXT =
  "At the beginning of combat on your turn, you may have this creature become a copy of another target creature until end of turn, except it's 1/4 and has \"This creature can't be blocked.\"";

export default defineCard({
  name: "Cephalid Facetaker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Rogue"],
  power: 1,
  toughness: 4,
  text: `${UNBLOCKABLE_TEXT}\n${COPY_TEXT}`,
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: UNBLOCKABLE_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Have Cephalid Facetaker become a copy of that creature until end of turn?",
        effect: {
          kind: "become-copy",
          target: "source",
          of: 0,
          until: "end-of-turn",
          exceptions: { basePt: [1, 4], keywords: ["unblockable"] },
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
