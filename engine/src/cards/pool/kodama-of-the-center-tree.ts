import { defineCard } from "../define.js";

const PT_TEXT = "Kodama of the Center Tree's power and toughness are each equal to the number of Spirits you control.";
const SOULSHIFT_TEXT =
  "Kodama of the Center Tree has soulshift X, where X is the number of Spirits you control. (When this creature dies, you may return target Spirit card with mana value X or less from your graveyard to your hand.)";

const spirits = { subtype: "Spirit", controlledBy: "you" } as const;

// Rulings: soulshift is a leaves-the-battlefield trigger, so X is the number of
// Spirits you controlled just before it died, itself included — at least 1
// (`asSourceLeft`, rule 603.10a); with five or more it can return itself
// (soulshift says no "other", rule 702.46a).
export default defineCard({
  name: "Kodama of the Center Tree",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${SOULSHIFT_TEXT}`,
  static: [
    {
      // A characteristic-defining ability (rule 604.3), counting itself.
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: spirits }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: { amount: { countOf: spirits, asSourceLeft: true } } } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: SOULSHIFT_TEXT,
    },
  ],
});
