import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";
import { EVERY_CREATURE_TYPE } from "../../subtypes.js";

const TEXT = "Until end of turn, creatures you control get +2/+0 and gain all creature types.";
const YOURS: CardFilter = { type: "creature", controlledBy: "you" };

export default defineCard({
  name: "Volatile Claws",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: YOURS, power: 2, toughness: 0, duration: "end-of-turn" },
      {
        kind: "for-each-permanent",
        filter: YOURS,
        simultaneous: true,
        effect: { kind: "become", target: 0, addSubtypes: [EVERY_CREATURE_TYPE], duration: "end-of-turn" },
      },
    ],
  },
});
