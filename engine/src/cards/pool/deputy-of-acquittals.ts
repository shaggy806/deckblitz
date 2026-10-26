import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, you may return another target creature you control to its owner's hand.";

export default defineCard({
  name: "Deputy of Acquittals",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "may",
        prompt: "Return the target creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
