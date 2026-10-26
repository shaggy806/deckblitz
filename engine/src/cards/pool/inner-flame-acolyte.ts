import { defineCard } from "../define.js";

// EDHREC rank 26644.

export default defineCard({
  name: "Inner-Flame Acolyte",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 2,
  toughness: 2,
  evoke: { cost: "{R}" },
  text: "When this creature enters, target creature gets +2/+0 and gains haste until end of turn.\nEvoke {R} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, target creature gets +2/+0 and gains haste until end of turn.",
    },
  ],
});
