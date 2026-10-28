import { defineCard } from "../define.js";

// EDHREC rank 11187.

export default defineCard({
  name: "Jareth, Leonine Titan",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Giant"],
  power: 4,
  toughness: 7,
  text: "Whenever Jareth blocks, it gets +7/+7 until end of turn.\n{W}: Jareth gains protection from the color of your choice until end of turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-protection",
        target: "source",
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}: Jareth gains protection from the color of your choice until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 7, toughness: 7, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever Jareth blocks, it gets +7/+7 until end of turn.",
    },
  ],
});
