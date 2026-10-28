import { defineCard } from "../define.js";

const CAST_TEXT =
  "When you cast this spell, amass Orcs 5, mill five cards, then return a creature card from your graveyard to the battlefield.";
const COMMANDER_TEXT = "Whenever a commander an opponent controls dies, the Ring tempts you.";

export default defineCard({
  name: "Sauron, Lord of the Rings",
  manaCost: "{5}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Horror"],
  power: 9,
  toughness: 9,
  keywords: ["trample"],
  text: `${CAST_TEXT}\nTrample\n${COMMANDER_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "amass", amount: 5, creatureType: "Orc" },
          { kind: "mill", target: "you", amount: 5 },
          // Any creature card in the graveyard, milled now or not (the rulings).
          { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      // Triggers even if the commander's owner then moves it to the command
      // zone (the rulings).
      trigger: { on: "dies", who: "any", filter: { type: "creature", isCommander: true, controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: COMMANDER_TEXT,
    },
  ],
});
