import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, create a number of 2/2 white Knight creature tokens with vigilance equal to the number of opponents you attacked this turn.";

export default defineCard({
  name: "Militant Angel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token", count: { turnStat: "opponents-attacked" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
