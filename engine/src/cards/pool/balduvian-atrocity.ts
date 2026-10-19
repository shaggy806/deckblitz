import { defineCard } from "../define.js";

// EDHREC rank 24801.
//
// The kicked rider is an ETB trigger with a `self-kicked` intervening-if; the
// reanimation is Apprentice Necromancer's shape — "it gains haste" with no
// duration, and a delayed trigger that sacrifices that object only (rule
// 400.7) and only while you still control it (rule 701.21a).

const ETB_TEXT =
  "When this creature enters, if it was kicked, return target creature card with mana value 3 or less from your graveyard to the battlefield. It gains haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Balduvian Atrocity",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Berserker"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Kicker {R} (You may pay an additional {R} as you cast this spell.)\nMenace\n${ETB_TEXT}`,
  kicker: { cost: "{R}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice the creature Balduvian Atrocity returned to the battlefield.",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
