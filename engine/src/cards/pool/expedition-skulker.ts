import { defineCard } from "../define.js";

// EDHREC rank 22821. Zendikar Rising.

export default defineCard({
  name: "Expedition Skulker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 2,
  text: "This creature has deathtouch as long as you control another Rogue. (Any amount of damage it deals to a creature is enough to destroy it.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Rogue" }, atLeast: 1, excludeSelf: true },
      grantKeywords: ["deathtouch"],
      text: "This creature has deathtouch as long as you control another Rogue.",
    },
  ],
});
