import { defineCard } from "../define.js";

// A 6/1 green Insect creature token with shroud (Deadly Grub).

export default defineCard({
  name: "Insect Token (Green, 6/1, Shroud)",
  art: "0ff2e2bd-b8e9-4563-85ad-fdbb0607fb7c",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 6,
  toughness: 1,
  keywords: ["shroud"],
  text: "Shroud (This creature can't be the target of spells or abilities.)",
});
