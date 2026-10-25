import { defineCard } from "../define.js";

const TEXT =
  "{3}{B}: This creature gets +X/+X until end of turn, where X is the number of creature cards in your graveyard. Activate only once each turn.";
const X = { countInGraveyard: { type: "creature", ownedBy: "you" } } as const;

export default defineCard({
  name: "Graverobber Spider",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: X, toughness: X, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
      oncePerTurn: true,
    },
  ],
});
