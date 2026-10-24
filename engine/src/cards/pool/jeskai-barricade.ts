import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, you may return another target creature you control to its owner's hand.";

export default defineCard({
  name: "Jeskai Barricade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["flash", "defender"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nDefender\n${ENTER_TEXT}`,
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
