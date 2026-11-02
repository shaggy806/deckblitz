import { defineCard } from "../define.js";

const ENTER_TEXT = "If this creature would enter and it wasn't cast or no mana was spent to cast it, exile it instead.";
const LEAVES_TEXT =
  "When this creature leaves the battlefield, exile the top ten cards of your library. You may cast any number of spells with total mana value 10 or less from among them without paying their mana costs.";

export default defineCard({
  name: "Primeval Spawn",
  manaCost: "{5}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 10,
  toughness: 10,
  keywords: ["vigilance", "trample", "lifelink"],
  text: `${ENTER_TEXT}\nVigilance, trample, lifelink\n${LEAVES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", instead: { exileUnless: { manaSpent: { op: "gte", n: 1 } } } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 10 },
          { kind: "cast-now", from: "exiled-this-way", repeat: true, totalManaValue: 10, free: true },
        ],
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
