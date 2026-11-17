import { defineCard } from "../define.js";

// EDHREC rank 12011.
//
// Rulings:
//   Timber Paladin's abilities each overwrite any previous effects that set creatures' power and/or
//   toughness to specific numbers. Any power- or toughness-setting effects that start to apply after
//   Timber Paladin enters the battlefield will overwrite these effects, regardless of when Timber
//   Paladin became enchanted by one, two, or three or more Auras.
//
// Each line is a static of its own whose `source` condition counts the Auras attached to it
// (`attachments`' `atLeast`/`atMost`), whoever controls them. A static's timestamp is its source's
// (rule 613.7a), so a later P/T-setting effect overwrites these whenever the Auras arrived — the
// ruling.

const ONE_TEXT = "As long as this creature is enchanted by exactly one Aura, it has base power and toughness 3/3.";
const TWO_TEXT =
  "As long as this creature is enchanted by exactly two Auras, it has base power and toughness 5/5 and vigilance.";
const THREE_TEXT =
  "As long as this creature is enchanted by three or more Auras, it has base power and toughness 10/10, vigilance, and trample.";

const AURA = { subtype: "Aura" } as const;

export default defineCard({
  name: "Timber Paladin",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Knight"],
  power: 1,
  toughness: 1,
  text: `${ONE_TEXT}\n${TWO_TEXT}\n${THREE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attachments: { filter: AURA, atLeast: 1, atMost: 1 } } },
      setBasePt: { power: 3, toughness: 3 },
      text: ONE_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attachments: { filter: AURA, atLeast: 2, atMost: 2 } } },
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["vigilance"],
      text: TWO_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attachments: { filter: AURA, atLeast: 3 } } },
      setBasePt: { power: 10, toughness: 10 },
      grantKeywords: ["vigilance", "trample"],
      text: THREE_TEXT,
    },
  ],
});
