import { defineCard } from "../define.js";

const FREE_TEXT = "You may pay {0} rather than pay the cycling cost of the first card you cycle each turn.";
const DRAW_TEXT = "Whenever you draw your second card each turn, create a 2/2 red and white Dinosaur Cat creature token.";

export default defineCard({
  name: "Gavi, Nest Warden",
  manaCost: "{2}{U}{R}{W}",
  colors: ["U", "R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 5,
  text: `${FREE_TEXT}\n${DRAW_TEXT}`,
  static: [{ affects: { scope: "self" }, alternativeAbilityCost: { kind: "cycling", mana: "{0}", firstEachTurn: true }, text: FREE_TEXT }],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Cat Token", count: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
