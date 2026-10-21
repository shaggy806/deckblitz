import { defineCard } from "../define.js";

// EDHREC rank 25705. "Attacks or blocks" is two trigger events of one ability
// (Burning Sun Cavalry's pair); "if you control another non-Human creature"
// is an intervening-if (rule 603.4), checked as it triggers and again as it
// resolves (the ruling).

const TEXT =
  "Whenever this creature attacks or blocks, if you control another non-Human creature, this creature gets +1/+1 until end of turn.";

const IF = {
  kind: "controls",
  filter: { type: "creature", notSubtypes: ["Human"] },
  atLeast: 1,
  excludeSelf: true,
} as const;
const PUMP = { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Wildwood Tracker",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: IF,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      sameAbilityAs: 0,
      condition: IF,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
