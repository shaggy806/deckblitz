import { defineCard } from "../define.js";

const TOKENS_TEXT = "If one or more tokens would be created, twice that many of those tokens are created instead.";
const COUNTERS_TEXT =
  "If one or more +1/+1 counters would be put on a creature, twice that many +1/+1 counters are put on that creature instead.";

export default defineCard({
  name: "Primal Vigor",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TOKENS_TEXT}\n${COUNTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", instead: { modify: { times: 2 } }, anyController: true },
      text: TOKENS_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        instead: { modify: { times: 2 } },
        anyController: true,
        counterKind: "+1/+1",
        filter: { type: "creature" },
      },
      text: COUNTERS_TEXT,
    },
  ],
});
