import { defineCard } from "../define.js";

// EDHREC rank 17669.
//
// "This creature or another Kithkin you control" is two triggers (Lossarnach
// Captain's shape): this one entering, Kithkin or not, and another Kithkin
// you control entering.
const TEXT =
  "Whenever this creature or another Kithkin you control enters, target creature you control gets +1/+1 and gains trample until end of turn.";
const PUMP = {
  kind: "sequence",
  effects: [
    { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
    { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
  ],
} as const;

export default defineCard({
  name: "Thoughtweft Lieutenant",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, filter: { subtype: "Kithkin" } },
      targets: ["creature-you-control"],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
