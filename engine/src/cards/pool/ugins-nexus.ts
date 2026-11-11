import { defineCard } from "../define.js";

// EDHREC rank 7460. An extra turn is skipped only as it would begin, so one
// this Nexus's own exile gives is taken once it has left (the rulings).
const SKIP_TEXT = "If a player would begin an extra turn, that player skips that turn instead.";
const EXILE_TEXT =
  "If Ugin's Nexus would be put into a graveyard from the battlefield, instead exile it and take an extra turn after this one.";

export default defineCard({
  name: "Ugin's Nexus",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${SKIP_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-begin-turn", who: "any", extraOnly: true },
      text: SKIP_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        from: "battlefield",
        filter: { isSource: true },
        instead: "exile",
        then: { kind: "take-extra-turn" },
      },
      text: EXILE_TEXT,
    },
  ],
});
