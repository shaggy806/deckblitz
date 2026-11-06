import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Whenever this creature or another Klingon or Warrior you control enters, creatures you control gain lifelink until end of turn.";

export default defineCard({
  name: "Indelicate Healer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Doctor"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtypes: ["Klingon", "Warrior"] } },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "lifelink",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
