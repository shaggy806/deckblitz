import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const RETURN_TEXT =
  "Whenever a 1/1 creature you control enters, you may return this card from your graveyard to the battlefield, then attach it to that creature.";

// The trigger works only from the graveyard. If "that creature" is gone, or
// can't be equipped, the Sword still returns, unattached (its ruling — an
// Equipment `put-onto-battlefield … attachedTo` enters unattached then).
export default defineCard({
  name: "Sword of the Meek",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+2.\nEquip {2}\n${RETURN_TEXT}`,
  activated: [equip("{2}")],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Equipped creature gets +1/+2." }],
  triggered: [
    {
      fromGraveyard: true,
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "eq", n: 1 }, toughness: { op: "eq", n: 1 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Sword of the Meek from your graveyard to the battlefield attached to that creature?",
        effect: { kind: "put-onto-battlefield", target: "source", attachedTo: "trigger-object" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
