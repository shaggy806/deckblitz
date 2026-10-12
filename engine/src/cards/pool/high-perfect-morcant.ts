import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// "Each opponent blights 1": each chooses a creature of their own, one at a
// time from the active player (rule 101.4); one who controls none can't
// (701.68b). "Morcant **or another** Elf": its own entry counts whatever its
// types then.
export default defineCard({
  name: "High Perfect Morcant",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 4,
  toughness: 4,
  text: "Whenever High Perfect Morcant or another Elf you control enters, each opponent blights 1. (They each put a -1/-1 counter on a creature they control.)\nTap three untapped Elves you control: Proliferate. Activate only as a sorcery. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Elf" } },
    targets: [],
    effect: { kind: "blight", amount: 1, who: "each-opponent" },
    resolve: null,
    text: "Whenever High Perfect Morcant or another Elf you control enters, each opponent blights 1.",
  }),
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 3, filter: { subtype: "Elf", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: "Tap three untapped Elves you control: Proliferate. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
