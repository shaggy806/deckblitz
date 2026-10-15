import { defineCard } from "../define.js";

// EDHREC rank 13961.
//
// "Another creature you control or a land you control": "another" belongs to
// the creature half only, so Long Feng himself counts once he's a land (an
// Ashaya, Soul of the Wild makes him a Forest). One printed ability as two
// entries: any other creature or land of yours (`otherOnly`), and Long Feng
// himself only while he's a land — each death fires exactly one of them.
const TEXT =
  "Whenever another creature you control or a land you control is put into a graveyard from the battlefield, put a +1/+1 counter on target creature you control.";
const counter = { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 } as const;

export default defineCard({
  name: "Long Feng, Grand Secretariat",
  manaCost: "{1}{B/G}{B/G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { typesAnyOf: ["creature", "land"] }, otherOnly: true },
      targets: ["creature-you-control"],
      effect: counter,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self", filter: { type: "land" } },
      sameAbilityAs: 0,
      targets: ["creature-you-control"],
      effect: counter,
      resolve: null,
      text: TEXT,
    },
  ],
});
