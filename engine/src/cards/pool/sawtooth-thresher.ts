import { defineCard } from "../define.js";

// EDHREC rank 28306.

export default defineCard({
  name: "Sawtooth Thresher",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)\nRemove two +1/+1 counters from this creature: It gets +4/+4 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 2 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: "Remove two +1/+1 counters from this creature: It gets +4/+4 until end of turn.",
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
