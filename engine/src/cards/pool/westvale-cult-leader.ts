import { defineCard } from "../define.js";

const PT_TEXT = "Westvale Cult Leader's power and toughness are each equal to the number of creatures you control.";
const TOKEN_TEXT = "At the beginning of your end step, create a 1/1 white and black Human Cleric creature token.";

export default defineCard({
  name: "Westvale Cult Leader",
  art: "https://cards.scryfall.io/art_crop/back/7/e/7e137566-5033-48e8-88ba-65e3821b3cec.jpg",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Human Cleric Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  faces: ["Hanweir Militia Captain", "Westvale Cult Leader"],
  transform: true,
});
