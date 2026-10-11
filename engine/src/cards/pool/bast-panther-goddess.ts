import { defineCard } from "../define.js";

// EDHREC rank 12010. Marvel Super Heroes Commander.
//
// Bast counts toward its own three creatures. X is the number of creatures
// you control as the trigger resolves.

const RESTRICT_TEXT = "Bast can't attack or block unless you control three or more creatures.";
const ATTACK_TEXT =
  "Whenever you attack, target attacking creature gets +X/+X until end of turn, where X is the number of creatures you control.";

const YOUR_CREATURES = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Bast, Panther Goddess",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "God"],
  power: 4,
  toughness: 4,
  keywords: ["reach", "trample", "indestructible"],
  text: `Reach, trample, indestructible\n${RESTRICT_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 3, countsSelf: true } },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: YOUR_CREATURES,
        toughness: YOUR_CREATURES,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
