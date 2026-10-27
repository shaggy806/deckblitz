import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 22257. Entwine: Rain of Rust's shape.

export default defineCard({
  name: "One Dozen Eyes",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{G}{G}{G}", keyword: "entwine" },
  text: "Choose one —\n• Create a 5/5 green Beast creature token.\n• Create five 1/1 green Insect creature tokens.\nEntwine {G}{G}{G} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Create a 5/5 green Beast creature token.",
        targets: [],
        effect: { kind: "create-token", token: "5/5 Beast Token", count: 1 },
      },
      {
        text: "Create five 1/1 green Insect creature tokens.",
        targets: [],
        effect: { kind: "create-token", token: "Insect Token", count: 5 },
      },
    ],
    kickedModes: 2,
  },
});
