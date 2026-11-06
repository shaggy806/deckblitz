import { defineCard } from "../define.js";

const TEMBA = "Temba, His Arms Wide — Target creature gets +3/+3 and gains trample until end of turn.";
const SHAKA =
  "Shaka, When the Walls Fell — Each opponent sacrifices a nontoken artifact or enchantment of their choice.";

export default defineCard({
  name: "Dathon and Picard at El-Adrel",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${TEMBA}\n• ${SHAKA}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: TEMBA,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: SHAKA,
        effect: {
          kind: "sacrifice",
          who: "each-opponent",
          filter: { typesAnyOf: ["artifact", "enchantment"], token: false },
          count: 1,
        },
      },
    ],
  },
});
