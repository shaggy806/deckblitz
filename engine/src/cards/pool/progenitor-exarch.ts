import { defineCard } from "../define.js";

// EDHREC rank 8664.
//
// "Incubate 3 X times" is X separate Incubator tokens of three counters each,
// X being what the creature was cast with (0 if it wasn't cast).

const INCUBATE =
  'When this creature enters, incubate 3 X times. (To incubate 3, create an Incubator token with three +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)';
const TRANSFORM = "{T}: Transform target Incubator token you control.";

export default defineCard({
  name: "Progenitor Exarch",
  manaCost: "{X}{X}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cat", "Cleric"],
  power: 1,
  toughness: 2,
  text: `${INCUBATE}\n${TRANSFORM}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Incubator", token: true } }],
      effect: { kind: "transform", target: 0 },
      resolve: null,
      text: TRANSFORM,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "repeat", times: "x", effect: { kind: "incubate", amount: 3 } },
      resolve: null,
      text: INCUBATE,
    },
  ],
});
