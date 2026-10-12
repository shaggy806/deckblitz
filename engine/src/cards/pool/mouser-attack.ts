import { defineCard } from "../define.js";

export default defineCard({
  name: "Mouser Attack!",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Create a 1/1 colorless Robot artifact creature token.\n• Target creature gets +3/+0 and gains first strike until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Create a 1/1 colorless Robot artifact creature token.",
        effect: { kind: "create-token", token: "Robot Token (Big Mother Mouser)", count: 1 },
      },
      {
        text: "Target creature gets +3/+0 and gains first strike until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
            {
              kind: "grant-keyword",
              target: 0,
              keyword: "first-strike",
              duration: "end-of-turn",
            },
          ],
        },
      },
    ],
  },
});
