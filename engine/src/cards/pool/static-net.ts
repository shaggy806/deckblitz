import { defineCard } from "../define.js";

// The exiled card returns the moment this leaves (rule 610.3 —
// `untilSourceLeaves`), with nothing in between (the ruling).
const EXILE_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";
const GAIN_TEXT = "When this enchantment enters, you gain 2 life and create a tapped Powerstone token.";

export default defineCard({
  name: "Static Net",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${EXILE_TEXT}\n${GAIN_TEXT} (It's an artifact with "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
        ],
      },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
