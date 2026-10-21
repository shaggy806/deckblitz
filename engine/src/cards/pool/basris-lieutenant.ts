import { defineCard } from "../define.js";

// "This creature or another creature you control dies" is any creature you
// control, the Lieutenant included: one dies trigger (Slurrk's shape). "If it
// had a +1/+1 counter on it" is read off the creature as it last existed on
// the battlefield (its rulings — -1/-1 counters that killed it don't matter),
// a past fact, so it holds the same at resolution; once however many it had.

const ETB_TEXT = "When this creature enters, put a +1/+1 counter on target creature you control.";
const DIES_TEXT =
  "Whenever this creature or another creature you control dies, if it had a +1/+1 counter on it, create a 2/2 white Knight creature token with vigilance.";

export default defineCard({
  name: "Basri's Lieutenant",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance, protection from multicolored\n${ETB_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { multicolored: true } },
      text: "Protection from multicolored",
    },
  ],
});
