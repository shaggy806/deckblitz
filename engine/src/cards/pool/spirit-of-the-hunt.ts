import { defineCard } from "../define.js";

const TEXT =
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
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
        power: 0,
        toughness: 3,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
