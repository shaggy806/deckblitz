import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, exile another target creature you control until this creature leaves the battlefield.";
const ATTACK_TEXT =
  "Whenever this creature attacks, create a tapped and attacking token that's a copy of the exiled card, except it's an Illusion in addition to its other types. Sacrifice that token at end of combat.";

export default defineCard({
  name: "Phantom Steed",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horse", "Illusion"],
  power: 4,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "exiled-with-source",
        count: 1,
        who: "you",
        tapped: true,
        attacking: "choose",
        exceptions: { addSubtypes: ["Illusion"] },
        sacrificeAtEndOfCombat: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
