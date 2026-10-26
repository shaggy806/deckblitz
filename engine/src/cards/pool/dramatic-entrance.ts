import { defineCard } from "../define.js";

export default defineCard({
  name: "Dramatic Entrance",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You may put a green creature card from your hand onto the battlefield.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "hand",
    min: 0,
    max: 1,
    destination: "battlefield",
    leftover: "stay",
    filter: { type: "creature", colors: ["G"] },
  },
});
