import { defineCard } from "../define.js";

// EDHREC rank 28213.

export default defineCard({
  name: "Woolly Mammoths",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 2,
  text: "This creature has trample as long as you control a snow land.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land", supertype: "snow" }, atLeast: 1 },
      grantKeywords: ["trample"],
      text: "This creature has trample as long as you control a snow land.",
    },
  ],
});
