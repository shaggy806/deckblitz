import { defineCard } from "../define.js";

// EDHREC rank 18069.
//
// A redirection (rule 614.9) for the rest of the turn, its controller asked
// each time damage would be dealt to a creature — any creature, theirs or
// not — for each source and each creature (a `replacement-effect` with `may`,
// redirecting to `"you"`; asked as Battletide Alchemist's "you may prevent"
// is, before an effect deals it and before combat damage). A redirection
// isn't prevention, so it's offered for damage that can't be prevented too.

const TEXT = "Until end of turn, if damage would be dealt to any creature, you may have that damage dealt to you instead.";

export default defineCard({
  name: "Blood of the Martyr",
  manaCost: "{W}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "replacement-effect",
    duration: "end-of-turn",
    replacement: {
      event: "would-deal-damage",
      toFilter: { type: "creature" },
      instead: { redirect: "you" },
      may: true,
    },
  },
});
