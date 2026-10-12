import { defineCard } from "../define.js";

export default defineCard({
  name: "Town Gossipmonger",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: "{T}, Tap an untapped creature you control: Transform this creature.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{T}, Tap an untapped creature you control: Transform this creature.",
    },
  ],
  faces: ["Town Gossipmonger", "Incited Rabble"],
  transform: true,
});
