import { defineCard } from "../define.js";

// EDHREC rank 109.
//
// Phasing (rule 702.26): every permanent you control — and whatever is
// attached to each, opponents' Auras included (702.26g) — is treated as
// though it doesn't exist until it phases in as your next untap step begins
// (502.1). "Your life total can't change" (rules 119.7–8) and protection
// from everything (702.16j: no targeting you, no Aura on you, all damage to
// you prevented) last until your next turn begins — before that untap step.
// Exiled as it resolves (`exileOnResolve`); countered, it goes to the
// graveyard.
const TEXT =
  "Until your next turn, your life total can't change and you gain protection from everything. All permanents you control phase out. (While they're phased out, they're treated as though they don't exist. They phase in before you untap during your untap step.)\nExile Teferi's Protection.";

export default defineCard({
  name: "Teferi's Protection",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "player-effect", duration: "until-your-next-turn", lifeCantChange: "you", protectionFromEverything: "you" },
      { kind: "phase-out", filter: { controlledBy: "you" } },
    ],
  },
  exileOnResolve: true,
});
