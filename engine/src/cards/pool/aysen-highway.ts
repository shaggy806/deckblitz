import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 28272.
//
// Every white creature, anyone's, has plainswalk.

export default defineCard({
  name: "Aysen Highway",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "White creatures have plainswalk. (They can't be blocked as long as defending player controls a Plains.)",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"] } },
      grantKeywords: ["plainswalk"],
      text: "White creatures have plainswalk.",
    },
  ],
});
