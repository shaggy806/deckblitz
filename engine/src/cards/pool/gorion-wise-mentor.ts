import { defineCard } from "../define.js";

// EDHREC rank 17463.

export default defineCard({
  name: "Gorion, Wise Mentor",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever you cast an Adventure spell, you may copy it. You may choose new targets for the copy.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Adventure" } },
      targets: [],
      // Chancellor of Tales's shape: the copy of an Adventure spell is exiled
      // as it resolves and then ceases to exist (the rulings).
      effect: {
        kind: "may",
        prompt: "Copy that Adventure spell?",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: "Whenever you cast an Adventure spell, you may copy it. You may choose new targets for the copy.",
    },
  ],
});
