import { defineCard } from "../define.js";

// EDHREC rank 16942.
// Makes Saproling → use "Saproling Token".

export default defineCard({
  name: "Rith's Charm",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target nonbasic land.\n• Create three 1/1 green Saproling creature tokens.\n• Prevent all damage a source of your choice would deal this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target nonbasic land.",
        targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Create three 1/1 green Saproling creature tokens.",
        effect: { kind: "create-token", token: "Saproling Token", count: 3 },
      },
      {
        text: "Prevent all damage a source of your choice would deal this turn.",
        effect: { kind: "prevent-damage-from-chosen-source", to: "any", amount: "all" },
      },
    ],
  },
});
