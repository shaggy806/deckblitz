import { defineCard } from "../define.js";

// Mystery Booster Commander. Danitha, Sword of Hope's "spell that targets"
// filter, for an Aura spell aimed at an opponent's creature.
const CANT = "Grakk can't attack or block.";
const DRAW =
  "Whenever you cast an Aura spell that targets a creature an opponent controls, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Grakk the Pacifist",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 4,
  toughness: 3,
  text: `${CANT}\n${DRAW}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-attack", "cant-block"], text: CANT }],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { subtype: "Aura", targets: { permanent: { type: "creature", controlledBy: "opponent" } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      oncePerTurn: true,
      resolve: null,
      text: DRAW,
    },
  ],
});
