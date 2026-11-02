import { defineCard } from "../define.js";

export default defineCard({
  name: "Avatar of Will",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: "If an opponent has no cards in hand, this spell costs {6} less to cast.\nFlying",
  selfCostReduction: {
    condition: { kind: "of-player", player: "an-opponent", condition: { kind: "hand-size", atMost: 0 } },
    reduceGeneric: 6,
  },
});
