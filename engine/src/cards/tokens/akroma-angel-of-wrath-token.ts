import { defineCard } from "../define.js";

/** The Akroma, Angel of Wrath token (Nivea, Beloved Battlemage): a copy of
 * the card — named Akroma, Angel of Wrath, legendary, its {5}{W}{W}{W} mana
 * cost and all. */
export default defineCard({
  name: "Akroma, Angel of Wrath Token",
  tokenName: "Akroma, Angel of Wrath",
  art: "bf1ef8ec-d915-41f2-b087-3d6d82e3db85",
  manaCost: "{5}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "first-strike", "vigilance", "trample", "haste"],
  text: "Flying, first strike, vigilance, trample, haste, protection from black and from red\n(This token's mana cost is {5}{W}{W}{W}.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B", "R"] },
      text: "Protection from black and from red",
    },
  ],
});
