import { defineCard } from "../define.js";

export default defineCard({
  name: "Wrecking Beast",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["riot", "trample"],
  text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)\nTrample",
});
