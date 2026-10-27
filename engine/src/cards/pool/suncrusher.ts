import { defineCard } from "../define.js";

// EDHREC rank 23785.

export default defineCard({
  name: "Suncrusher",
  manaCost: "{9}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 3,
  text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)\n{4}, {T}, Remove a +1/+1 counter from this creature: Destroy target creature.\n{2}, Remove a +1/+1 counter from this creature: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{4}", tap: true, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{4}, {T}, Remove a +1/+1 counter from this creature: Destroy target creature.",
    },
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from this creature: Return this creature to its owner's hand.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)",
    },
  ],
});
