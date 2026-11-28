import { defineCard } from "../define.js";

// EDHREC rank 30293.
//
// "Using teamwork" (rule 702.194b) is the spell's teamwork cost paid as it was
// cast: the `castUsing` filter, read as it's on the stack. A spell kicked with
// an ordinary kicker, or a teamwork spell cast without tapping, isn't one.
const CAST_TEXT =
  "Whenever you cast a spell using teamwork, create a 1/1 colorless Robot Hero artifact creature token with flying.";

export default defineCard({
  name: "Virtual Assistant",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Illusion", "Advisor"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { castUsing: "teamwork" } },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Robot Hero Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
