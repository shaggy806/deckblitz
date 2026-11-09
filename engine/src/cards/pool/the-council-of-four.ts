import { defineCard } from "../define.js";

const DURING_THEIR_TURN = { kind: "of-player", player: "that-player", condition: { kind: "your-turn" } } as const;

export default defineCard({
  name: "The Council of Four",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 0,
  toughness: 8,
  text: "Whenever a player draws their second card during their turn, you draw a card.\nWhenever a player casts their second spell during their turn, you create a 2/2 white Knight creature token.",
  triggered: [
    {
      trigger: { on: "draws", who: "any", nthEachTurn: 2 },
      whileCondition: DURING_THEIR_TURN,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a player draws their second card during their turn, you draw a card.",
    },
    {
      trigger: { on: "cast-spell", who: "any", filter: { controlledBy: "active-player" }, nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "2/2 White Knight Token", count: 1 },
      resolve: null,
      text: "Whenever a player casts their second spell during their turn, you create a 2/2 white Knight creature token.",
    },
  ],
});
