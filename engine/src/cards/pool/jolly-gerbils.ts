import { defineCard } from "../define.js";

// Bloomburrow. EDHREC rank 14547.
// "Whenever you give a gift" (rule 702.174c): an instant or sorcery of yours
// whose gift was promised resolves, or a permanent's gift trigger of yours
// resolves — whatever the gift became (the ruling).
export default defineCard({
  name: "Jolly Gerbils",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Hamster", "Citizen"],
  power: 2,
  toughness: 3,
  text: "Whenever you give a gift, draw a card.",
  triggered: [
    {
      trigger: { on: "event", event: "gives-gift", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you give a gift, draw a card.",
    },
  ],
});
