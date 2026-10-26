import { defineCard } from "../define.js";

const TEXT = "Whenever another creature dies, you may put X +1/+1 counters on Kresh, where X is that creature's power.";

export default defineCard({
  name: "Kresh the Bloodbraided",
  manaCost: "{2}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      // X is the creature's power as it last existed on the battlefield (the ruling).
      effect: {
        kind: "may",
        prompt: "Put X +1/+1 counters on Kresh?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { powerOf: "trigger-object" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
