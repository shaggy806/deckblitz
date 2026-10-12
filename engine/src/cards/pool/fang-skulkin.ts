import { defineCard } from "../define.js";

export default defineCard({
  name: "Fang Skulkin",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 1,
  text: "{2}: Target black creature gains wither until end of turn. (It deals damage to creatures in the form of -1/-1 counters.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { colors: ["B"], type: "creature" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "wither", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target black creature gains wither until end of turn.",
    },
  ],
});
