import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Whenever this creature or another Ally you control enters, you may put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Kazandu Blademaster",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike", "vigilance"],
  text: `First strike, vigilance\n${TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Kazandu Blademaster?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
