import { defineCard } from "../define.js";

export default defineCard({
  name: "Selesnya Charm",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Choose one —\n• Target creature gets +2/+2 and gains trample until end of turn.\n• Exile target creature with power 5 or greater.\n• Create a 2/2 white Knight creature token with vigilance.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature gets +2/+2 and gains trample until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: "Exile target creature with power 5 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 5 } } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Create a 2/2 white Knight creature token with vigilance.",
        effect: { kind: "create-token", token: "Knight Token", count: 1 },
      },
    ],
  },
});
