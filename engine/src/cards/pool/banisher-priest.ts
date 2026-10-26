import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, exile target creature an opponent controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Banisher Priest",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
