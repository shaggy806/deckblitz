import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// The exiled card stays linked to this permanent (rule 607.2a): it has each
// listed keyword a card exiled with it has, for as long as that card stays
// exiled — every "hexproof from [quality]" too (rule 702.11d-e). If the
// target is illegal as the ability resolves, nothing happens, the counter
// included (its ruling; rule 608.2b).
const EXILE_TEXT = "Whenever this creature enters or attacks, exile target card from a graveyard. Put a +1/+1 counter on this creature.";
const KEYWORDS_TEXT =
  "This creature has flying as long as a card exiled with it has flying. The same is true for first strike, double strike, deathtouch, haste, hexproof, indestructible, lifelink, menace, reach, trample, and vigilance.";

const exileAndGrow = (on: "enters-battlefield" | "attacks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0, linked: true },
      { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
    ],
  },
  resolve: null,
  text: EXILE_TEXT,
});

export default defineCard({
  name: "Urborg Scavengers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `${EXILE_TEXT}\n${KEYWORDS_TEXT}`,
  triggered: [exileAndGrow("enters-battlefield"), exileAndGrow("attacks")],
  static: [
    {
      affects: { scope: "self" },
      sharesKeywords: {
        from: "exiled-with-source",
        keywords: [
          "flying",
          "first-strike",
          "double-strike",
          "deathtouch",
          "haste",
          "hexproof",
          "indestructible",
          "lifelink",
          "menace",
          "reach",
          "trample",
          "vigilance",
        ],
      },
      text: KEYWORDS_TEXT,
    },
  ],
});
