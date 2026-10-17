import { defineCard } from "../define.js";

// EDHREC rank 9125.

const TEXT = "When this creature enters, amass Orcs 2.";

export default defineCard({
  name: "Dunland Crebain",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Horror"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Put two +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Orc" },
      resolve: null,
      text: TEXT,
    },
  ],
});
