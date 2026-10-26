import { defineCard } from "../define.js";

// Rulings: every Dragon is untapped, the ones you already controlled too; the
// control change lasts indefinitely, past Karrthus leaving the battlefield.

export default defineCard({
  name: "Karrthus, Tyrant of Jund",
  manaCost: "{4}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "haste"],
  text: "Flying, haste\nWhen Karrthus enters, gain control of all Dragons, then untap all Dragons.\nOther Dragon creatures you control have haste.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control-all", filter: { subtype: "Dragon" }, untilEndOfTurn: false },
          { kind: "untap-all", filter: { subtype: "Dragon" } },
        ],
      },
      resolve: null,
      text: "When Karrthus enters, gain control of all Dragons, then untap all Dragons.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Dragon" },
      grantKeywords: ["haste"],
      text: "Other Dragon creatures you control have haste.",
    },
  ],
});
