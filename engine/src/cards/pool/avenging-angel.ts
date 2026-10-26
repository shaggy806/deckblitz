import { defineCard } from "../define.js";

// Ruling [2008-04-01]: a dies trigger, not a replacement — the Angel goes to
// the graveyard first (other dies triggers see it), then may go on top.

export default defineCard({
  name: "Avenging Angel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, you may put it on top of its owner's library.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put Avenging Angel on top of its owner's library?",
        effect: { kind: "put-on-library", target: "trigger-object", position: "top" },
      },
      resolve: null,
      text: "When this creature dies, you may put it on top of its owner's library.",
    },
  ],
});
