import { defineCard } from "../define.js";

// EDHREC rank 10861.
//
// "Where X is Obuun's power" is read as the ability resolves (`powerOf:
// "source"`, its last-known power if it has left). The animated land keeps
// its abilities and sets a base P/T in layer 7b (Jolrael's shape).

const COMBAT_TEXT =
  "At the beginning of combat on your turn, up to one target land you control becomes an X/X Elemental creature with trample and haste until end of turn, where X is Obuun's power. It's still a land.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Obuun, Mul Daya Ancestor",
  manaCost: "{1}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Spirit"],
  power: 3,
  toughness: 3,
  text: `${COMBAT_TEXT}\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "land-you-control" }],
      effect: {
        kind: "animate",
        target: 0,
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        keywords: ["trample", "haste"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
