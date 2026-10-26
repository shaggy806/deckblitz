import { defineCard } from "../define.js";

// Portal Three Kingdoms. EDHREC rank 30035.

export default defineCard({
  name: "Zuo Ci, the Mocking Sage",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 2,
  keywords: ["hexproof"],
  text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)\nZuo Ci can't be blocked by creatures with horsemanship.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { keyword: "horsemanship" },
      text: "Zuo Ci can't be blocked by creatures with horsemanship.",
    },
  ],
});
