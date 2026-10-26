import { defineCard } from "../define.js";

export default defineCard({
  name: "Yew Spirit",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit", "Treefolk"],
  power: 3,
  toughness: 3,
  text: "{2}{G}{G}: This creature gets +X/+X until end of turn, where X is its power.",
  activated: [
    {
      // X is read as the ability resolves, and a negative power counts as 0
      // (the rulings — `powerOf` is clamped at 0).
      cost: { mana: "{2}{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{G}{G}: This creature gets +X/+X until end of turn, where X is its power.",
    },
  ],
});
