import { defineCard } from "../define.js";

// Felidar Guardian's blink, narrowed to another creature you control. A
// token exiled this way ceases to exist (the ruling).

const ETB_TEXT =
  "When this creature enters, you may exile another target creature you control, then return that card to the battlefield under its owner's control.";

export default defineCard({
  name: "Wispweaver Angel",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "may",
        prompt: "Exile that creature and return it?",
        effect: { kind: "flicker", target: 0 },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
