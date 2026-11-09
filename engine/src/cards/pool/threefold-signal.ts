import { defineCard } from "../define.js";

const GRANT =
  "Each spell you cast that's exactly three colors has replicate {3}. (When you cast it, copy it for each time you paid its replicate cost. You may choose new targets for the copies. A copy of a permanent spell becomes a token.)";

export default defineCard({
  name: "Threefold Signal",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `When this artifact enters, scry 3.\n${GRANT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 3 },
      resolve: null,
      text: "When this artifact enters, scry 3.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { colorCount: 3 }, keywordValues: [{ keyword: "replicate", cost: "{3}" }] },
      text: GRANT,
    },
  ],
});
