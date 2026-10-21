import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 19827.

const TEXT = "When this creature enters, put a +1/+1 counter on each other creature you control named Charmed Stray.";

export default defineCard({
  name: "Charmed Stray",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", name: "Charmed Stray" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
