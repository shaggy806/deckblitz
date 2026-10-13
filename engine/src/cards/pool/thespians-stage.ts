import { defineCard } from "../define.js";

// EDHREC rank 580.
//
// The copy has no duration (rule 611.2a): it lasts until the land leaves the
// battlefield or another copy effect overwrites it, and it no longer has
// "{T}: Add {C}" — only what it copies and this ability, which is part of
// its copiable values (rule 707.9a), so a land that copies it has it too.
// Nothing enters, so no "enters" or "as this enters" ability of the copied
// land applies (Dark Depths' counters never arrive), and it stays tapped
// (rule 707.4). A land animated for the turn is copied unanimated.
const COPY_TEXT = "{2}, {T}: This land becomes a copy of target land, except it has this ability.";

export default defineCard({
  name: "Thespian's Stage",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: ["land"],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        exceptions: { thisAbility: { card: "Thespian's Stage", activated: 1 } },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
