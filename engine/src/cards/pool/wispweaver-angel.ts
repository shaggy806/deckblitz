import { defineCard } from "../define.js";

// EDHREC rank 14294. Soulherder's flicker on an enters trigger: a token
// exiled this way ceases to exist (the ruling).

const TEXT =
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
  text: `Flying\n${TEXT}`,
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
      text: TEXT,
    },
  ],
});
