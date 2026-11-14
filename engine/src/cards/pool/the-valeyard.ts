import { defineCard } from "../define.js";

// EDHREC rank 8307.
//
// Facing a villainous choice an additional time is the whole choose-then-do
// process again, after the first is done (rule 701.55c): the opponent may
// make the same choice or the other one.

const VILLAIN_TEXT = "If an opponent would face a villainous choice, they face that choice an additional time.";
const VOTE_TEXT = "While voting, you may vote an additional time.";

export default defineCard({
  name: "The Valeyard",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Noble"],
  power: 4,
  toughness: 5,
  text: `${VILLAIN_TEXT} (They can make the same or different choices.)\n${VOTE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-face-villainous-choice", who: "opponent", instead: { modify: { plus: 1 } } },
      text: VILLAIN_TEXT,
    },
    { affects: { scope: "self" }, votesAdditionalTime: true, text: VOTE_TEXT },
  ],
});
