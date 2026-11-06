import { defineCard } from "../define.js";

const TEXT = "Whenever an opponent draws a card during your turn, create a 1/1 blue Faerie creature token with flying.";

export default defineCard({
  name: "Troi, Winging It",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Betazoid", "Human", "Advisor"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "opponent" },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "create-token", token: "Faerie Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
