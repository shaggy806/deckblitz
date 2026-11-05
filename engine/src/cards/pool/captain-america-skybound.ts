import { defineCard } from "../define.js";

const TEXT =
  "Battalion — Whenever Captain America and at least two other creatures attack, put a +1/+1 counter on each attacking creature. They gain indestructible until end of turn.";
const ATTACKING = { type: "creature", attacking: true } as const;

export default defineCard({
  name: "Captain America, Skybound",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 3,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT} (Damage and effects that say "destroy" don't destroy them.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: ATTACKING, atLeast: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: ATTACKING, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword-all", filter: ATTACKING, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
