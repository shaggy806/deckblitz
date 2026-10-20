import { defineCard } from "../define.js";

const TEXT = "Whenever you cast your second spell each turn, you gain 2 life.";

export default defineCard({
  name: "Doomskar Oracle",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 2,
  text: `${TEXT}\nForetell {W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
  foretell: { cost: "{W}" },
});
