import { defineCard } from "../define.js";

const TEXT =
  "Strange new worlds — {6}: This creature gets +2/+2 until end of turn. This ability costs {X} less to activate, where X is the number of differently named lands you control. Activate only once each turn.";

export default defineCard({
  name: "Astute Terraformer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Vulcan", "Scientist"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      costReduction: {
        reduceGeneric: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      oncePerTurn: true,
      text: TEXT,
    },
  ],
});
