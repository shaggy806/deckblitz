import { defineCard } from "../define.js";

// EDHREC rank 26476.

export default defineCard({
  name: "Fanatic of Xenagos",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  tribute: 1,
  text: "Trample\nTribute 1 (As this creature enters, an opponent of your choice may put a +1/+1 counter on it.)\nWhen this creature enters, if tribute wasn't paid, it gets +1/+1 and gains haste until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" }, { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" }] },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, it gets +1/+1 and gains haste until end of turn.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
