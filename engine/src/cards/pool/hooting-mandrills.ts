import { defineCard } from "../define.js";

// EDHREC rank 14025.
export default defineCard({
  name: "Hooting Mandrills",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  delve: true,
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nTrample",
});
