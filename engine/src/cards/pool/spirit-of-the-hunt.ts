import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, each other creature you control that's a Wolf or a Werewolf gets +0/+3 until end of turn.";

export default defineCard({
  name: "Spirit of the Hunt",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
        exceptSource: true,
        power: 0,
        toughness: 3,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
