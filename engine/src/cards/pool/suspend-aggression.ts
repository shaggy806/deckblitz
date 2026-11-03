import { defineCard } from "../define.js";

export default defineCard({
  name: "Suspend Aggression",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "Exile target nonland permanent and the top card of your library. For each of those cards, its owner may play it until the end of their next turn.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "exile",
        target: 0,
        mayCast: { duration: "your-next-turn", play: true, byOwner: true },
      },
      { kind: "impulse-exile", amount: 1, duration: "your-next-turn", playedBy: "owner" },
    ],
  },
});
