import { defineCard } from "../define.js";

// EDHREC rank 11199. Gruul Beastmaster's pump to a legendary creature; Infernal
// Vessel's "if it wasn't a [type]" return, read off Fang as he last existed.

const ATTACK_TEXT =
  "Whenever Fang attacks, another target legendary creature you control gets +X/+0 until end of turn, where X is Fang's power.";
const DIES_TEXT =
  "When Fang dies, if he wasn't a Spirit, return this card to the battlefield under your control. He's a Spirit in addition to his other types.";

export default defineCard({
  name: "Fang, Roku's Companion",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature", supertype: "legendary" } } },
      ],
      effect: { kind: "modify-pt", target: 0, power: { powerOf: "source" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { notSubtypes: ["Spirit"] } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        underYourControl: true,
        addSubtypes: ["Spirit"],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
