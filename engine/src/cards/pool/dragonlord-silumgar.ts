import { defineCard } from "../define.js";

// EDHREC rank 6845.

export default defineCard({
  name: "Dragonlord Silumgar",
  manaCost: "{4}{U}{B}",
  colors: ["B", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 3,
  toughness: 5,
  keywords: ["flying", "deathtouch"],
  text: "Flying, deathtouch\nWhen Dragonlord Silumgar enters, gain control of target creature or planeswalker for as long as you control Dragonlord Silumgar.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: "When Dragonlord Silumgar enters, gain control of target creature or planeswalker for as long as you control Dragonlord Silumgar.",
    },
  ],
});
