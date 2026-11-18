import { defineCard } from "../define.js";

// Commander 2015 (C15). EDHREC rank 15999.
//
// The journal's `destroyed` entries (rule 701.8b): a noncreature permanent
// you controlled as it was destroyed, read as it last existed, by a spell or
// ability an opponent controlled — a "destroy" effect of theirs, never the
// lethal-damage state-based actions (no spell or ability destroys then),
// a sacrifice or anything else put into a graveyard. A creature that was
// destroyed doesn't open it, even a Vehicle crewed at the time.
const ALT_TEXT =
  "If a noncreature permanent under your control was destroyed this turn by a spell or ability an opponent controlled, you may pay {G} rather than pay this spell's mana cost.";

export default defineCard({
  name: "Cobra Trap",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: `${ALT_TEXT}\nCreate four 1/1 green Snake creature tokens.`,
  alternativeCost: {
    mana: "{G}",
    condition: { kind: "turn-history", what: "destroyed", who: "you", filter: { notTypes: ["creature"] }, by: "opponent" },
  },
  targets: [],
  effect: { kind: "create-token", token: "Snake Token", count: 4 },
});
