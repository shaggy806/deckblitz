import { defineCard } from "../define.js";

// The mode is chosen as the trigger goes on the stack (rule 700.2b —
// `announced`); "that creature" is the one that entered, as it is when the
// trigger resolves.
const ETB_TEXT = "Whenever Gylwain or another nontoken creature you control enters, choose one —";
const ROYAL = "• Create a Royal Role token attached to that creature.";
const SORCERER = "• Create a Sorcerer Role token attached to that creature.";
const MONSTER = "• Create a Monster Role token attached to that creature.";

// "Gylwain or another nontoken creature": Gylwain itself — a token copy of it
// too — then any other nontoken creature you control, one ability with two
// trigger events (`sameAbilityAs`).
const MODES = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: 1,
  modes: [
    { text: ROYAL, effect: { kind: "create-token", token: "Royal Role Token", count: 1, attachedTo: "trigger-object" } },
    { text: SORCERER, effect: { kind: "create-token", token: "Sorcerer Role Token", count: 1, attachedTo: "trigger-object" } },
    { text: MONSTER, effect: { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: "trigger-object" } },
  ],
} as const;

export default defineCard({
  name: "Gylwain, Casting Director",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT}\n${ROYAL}\n${SORCERER}\n${MONSTER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: MODES,
      resolve: null,
      text: `${ETB_TEXT} ${ROYAL} ${SORCERER} ${MONSTER}`,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: false }, otherOnly: true },
      sameAbilityAs: 0,
      targets: [],
      effect: MODES,
      resolve: null,
      text: `${ETB_TEXT} ${ROYAL} ${SORCERER} ${MONSTER}`,
    },
  ],
});
