import { defineCard } from "../define.js";

const TEXT =
  "Whenever you put one or more +1/+1 counters on one or more other Heroes you control, you may create a 0/4 colorless Wall creature token with defender.";

export default defineCard({
  name: "Invisible Woman, Sue Storm",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 5,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "counters-put",
        who: "you-control",
        filter: { subtype: "Hero" },
        counter: "+1/+1",
        byYou: true,
        otherOnly: true,
        batched: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 0/4 colorless Wall creature token with defender?",
        effect: { kind: "create-token", token: "Wall Token (The Fantastic Four)", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
