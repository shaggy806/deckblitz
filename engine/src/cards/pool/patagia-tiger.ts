import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, target Human you control gets +2/+2 until end of turn.";

export default defineCard({
  name: "Patagia Tiger",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Human" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
