import { defineCard } from "../define.js";

export default defineCard({
  name: "Merfolk Cave-Diver",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 4,
  text: "Whenever a creature you control explores, this creature gets +1/+0 until end of turn and can't be blocked this turn.",
  triggered: [
    {
      trigger: { on: "explores", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever a creature you control explores, this creature gets +1/+0 until end of turn and can't be blocked this turn.",
    },
  ],
});
