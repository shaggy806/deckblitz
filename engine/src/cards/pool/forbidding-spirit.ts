import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, until your next turn, creatures can't attack you or planeswalkers you control unless their controller pays {2} for each of those creatures.";

export default defineCard({
  name: "Forbidding Spirit",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "until-your-next-turn",
        attackTax: { generic: 2, covers: "you-and-planeswalkers" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
