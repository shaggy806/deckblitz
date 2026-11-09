import { defineCard } from "../define.js";

export default defineCard({
  name: "Immerwolf",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  keywords: ["intimidate"],
  text: "Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\nEach other creature you control that's a Wolf or a Werewolf gets +1/+1.\nNon-Human Werewolves you control can't transform.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", anyOf: [{ subtype: "Wolf" }, { subtype: "Werewolf" }] }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Each other creature you control that's a Wolf or a Werewolf gets +1/+1.",
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "transform", object: { subtype: "Werewolf", notSubtypes: ["Human"], controlledBy: "you" } }],
      text: "Non-Human Werewolves you control can't transform.",
    },
  ],
});
