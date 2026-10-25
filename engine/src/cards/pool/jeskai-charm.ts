import { defineCard } from "../define.js";

// EDHREC rank 9181. Khans of Tarkir.

export default defineCard({
  name: "Jeskai Charm",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["instant"],
  text: "Choose one —\n• Put target creature on top of its owner's library.\n• Jeskai Charm deals 4 damage to target opponent or planeswalker.\n• Creatures you control get +1/+1 and gain lifelink until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Put target creature on top of its owner's library.",
        targets: ["creature"],
        effect: { kind: "put-on-library", target: 0, position: "top" },
      },
      {
        text: "Jeskai Charm deals 4 damage to target opponent or planeswalker.",
        targets: ["opponent-or-planeswalker"],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "Creatures you control get +1/+1 and gain lifelink until end of turn.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              power: 1,
              toughness: 1,
              duration: "end-of-turn",
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "lifelink",
              duration: "end-of-turn",
            },
          ],
        },
      },
    ],
  },
});
