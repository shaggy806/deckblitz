import { defineCard } from "../define.js";

const PACK =
  "Pack tactics — Whenever Targ Nar attacks, if you attacked with creatures with total power 6 or greater this combat, attacking creatures get +1/+0 until end of turn.";
const DOUBLE = "{2}{R}{G}: Double Targ Nar's power and toughness until end of turn.";

// Adventures in the Forgotten Realms.
export default defineCard({
  name: "Targ Nar, Demon-Fang Gnoll",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gnoll"],
  power: 2,
  toughness: 2,
  text: `${PACK}\n${DOUBLE}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PACK,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source", doubling: true },
        toughness: { toughnessOf: "source", doubling: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: DOUBLE,
    },
  ],
});
