import { defineCard } from "../define.js";

const TEXT = "This creature has deathtouch as long as you control a Liliana planeswalker.";

export default defineCard({
  name: "Arisen Gorgon",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Gorgon"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Any amount of damage this deals to a creature is enough to destroy it.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Liliana" }, atLeast: 1, countsSelf: true },
      grantKeywords: ["deathtouch"],
      text: TEXT,
    },
  ],
});
