import { defineCard } from "../define.js";

export default defineCard({
  name: "Restless Bones",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 1,
  text: "{3}{B}, {T}: Target creature gains swampwalk until end of turn. (It can't be blocked as long as defending player controls a Swamp.)\n{1}{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{3}{B}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "swampwalk", duration: "end-of-turn" },
      resolve: null,
      text: "{3}{B}, {T}: Target creature gains swampwalk until end of turn.",
    },
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}: Regenerate this creature.",
    },
  ],
});
