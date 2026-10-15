import { defineCard } from "../define.js";

// EDHREC rank 20252.
//
// The Equipment is "up to one", so the trigger can go on the stack with no
// Equipment chosen; the creature you control is required. An Equipment
// already on that creature stays put. "It connives" is the equipped attacker
// (Baron Strucker's `trigger-object` connive), its counter going on it.
const ATTACH_TEXT =
  "Whenever another Villain you control enters, attach up to one target Equipment you control to target creature you control.";
const CONNIVE_TEXT = "Whenever an equipped creature you control attacks, it connives.";

export default defineCard({
  name: "Swordsman, Sharp Scoundrel",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero", "Villain"],
  power: 2,
  toughness: 2,
  text: `${ATTACH_TEXT}\n${CONNIVE_TEXT} (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Villain" },
        otherOnly: true,
      },
      targets: [
        { kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } } },
        "creature-you-control",
      ],
      effect: { kind: "attach", target: 1, attachment: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { equipped: true } },
      targets: [],
      effect: { kind: "connive", target: "trigger-object" },
      resolve: null,
      text: CONNIVE_TEXT,
    },
  ],
});
