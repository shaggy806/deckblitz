import { defineCard } from "../define.js";

const LEYLINE_TEXT = "If this card is in your opening hand, you may begin the game with it on the battlefield.";
const COPY_TEXT =
  "Whenever you cast an instant or sorcery spell that targets only a single creature you control, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Leyline of Resonance",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${LEYLINE_TEXT}\n${COPY_TEXT}`,
  beginsOnBattlefield: true,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          typesAnyOf: ["instant", "sorcery"],
          targets: { only: true, single: true, permanent: { type: "creature", controlledBy: "you" } },
        },
      },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
