import { defineCard } from "../define.js";

export default defineCard({
  name: "Zhur-Taa Goblin",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 2,
  toughness: 2,
  keywords: ["riot"],
  text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)",
});
