import { defineCard } from "../define.js";

const FIRST = "Target creature gets +1/+1 and gains first strike until end of turn.";
const DOUBLE = "Target Pirate gets +1/+1 and gains double strike until end of turn.";

export default defineCard({
  name: "Buccaneer's Bravado",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${FIRST}\n• ${DOUBLE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: FIRST,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: DOUBLE,
        targets: [{ kind: "permanent", filter: { subtype: "Pirate" } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
