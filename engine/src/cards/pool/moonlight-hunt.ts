import { defineCard } from "../define.js";

// Shadows over Innistrad (SOI). EDHREC rank 9074. Each Wolf or Werewolf is a
// source of its own, all dealing their damage at once; none if the target
// has gone illegal (the spell doesn't resolve).

export default defineCard({
  name: "Moonlight Hunt",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text:
    "Choose target creature you don't control. Each creature you control that's a Wolf or a Werewolf deals damage equal to its power to that creature.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "each-deals-damage",
    filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
    amount: "its-power",
    to: 0,
  },
});
