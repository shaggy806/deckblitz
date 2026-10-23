import { defineCard } from "../define.js";

// EDHREC rank 7611.
//
// One static over the creatures that are a Wolf or a Werewolf, so one that's
// both gets +1/+1 once (the ruling).
const TEXT = "Each creature you control that's a Wolf or a Werewolf gets +1/+1 and has trample.";

export default defineCard({
  name: "Howlpack Resurgence",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
      },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
