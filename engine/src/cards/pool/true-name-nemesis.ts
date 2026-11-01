import { defineCard } from "../define.js";

// Rule 702.16k: the chosen player's objects, whatever they are; an object with no
// controller is its owner's (the ruling).

const TEXT = "This creature has protection from the chosen player.";

export default defineCard({
  name: "True-Name Nemesis",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 3,
  toughness: 1,
  choosePlayerOnEnter: "player",
  text: `As this creature enters, choose a player.\n${TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { fromPlayers: "chosen" }, text: TEXT }],
});
