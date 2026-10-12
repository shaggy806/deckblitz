import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghor-Clan Wrecker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["riot", "menace"],
  text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)\nMenace (This creature can't be blocked except by two or more creatures.)",
});
