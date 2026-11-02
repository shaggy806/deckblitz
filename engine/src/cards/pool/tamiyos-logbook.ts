import { defineCard } from "../define.js";

const TEXT = "{5}{U}, {T}: Draw a card. This ability costs {1} less to activate for each other artifact you control.";

export default defineCard({
  name: "Tamiyo's Logbook",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}{U}", tap: true },
      costReduction: { reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" }, excludeSelf: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
