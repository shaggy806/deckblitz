import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT = "Whenever this creature or another creature you control enters, you gain 1 life.";

export default defineCard({
  name: "Kor Celebrant",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    }),
  ],
});
