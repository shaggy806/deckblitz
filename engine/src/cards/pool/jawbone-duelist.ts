import { defineCard } from "../define.js";

// EDHREC rank 10039.

export default defineCard({
  name: "Jawbone Duelist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Soldier"],
  power: 1,
  toughness: 1,
  toxic: 1,
  keywords: ["double-strike"],
  text: "Double strike\nToxic 1 (Players dealt combat damage by this creature also get a poison counter.)",
});
