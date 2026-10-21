import { defineCard } from "../define.js";

const ETB = "When this creature enters, create a 1/1 red Satyr creature token with \"This token can't block.\"";
const HEROIC = "Whenever you cast a spell that targets this creature, creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Heroes of the Revel",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr", "Soldier"],
  power: 4,
  toughness: 4,
  text: `${ETB}\n${HEROIC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Satyr Token", count: 1 },
      resolve: null,
      text: ETB,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: HEROIC,
    },
  ],
});
