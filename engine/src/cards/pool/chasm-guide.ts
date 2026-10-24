import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 15344.

const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, creatures you control gain haste until end of turn.";

export default defineCard({
  name: "Chasm Guide",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout", "Ally"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
    targets: [],
    effect: {
      kind: "grant-keyword-all",
      filter: { type: "creature", controlledBy: "you" },
      keyword: "haste",
      duration: "end-of-turn",
    },
    resolve: null,
    text: TEXT,
  }),
});
