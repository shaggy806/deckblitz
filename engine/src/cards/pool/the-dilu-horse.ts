import { defineCard } from "../define.js";

export default defineCard({
  name: "The Dilu Horse",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 2,
  toughness: 2,
  keywords: ["horsemanship"],
  pairing: { kind: "partner" },
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nCommanders you control have horsemanship.\nPartner (You can have two commanders if both have partner.)",
  static: [
    {
      affects: { scope: "filter", filter: { isCommander: true, controlledBy: "you" } },
      grantKeywords: ["horsemanship"],
      text: "Commanders you control have horsemanship.",
    },
  ],
});
