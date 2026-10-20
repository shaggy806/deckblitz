import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// Rulings:
//   A copy is created even if Sea Gate Stormcaller leaves the battlefield before its
//   delayed triggered ability is created.
//   The delayed triggered ability will copy any instant or sorcery spell, not just one with
//   targets. A copy is created even if that spell has been countered by the time the
//   ability resolves.
//   For spells with {X} in their mana costs, use the value chosen for X to determine the
//   spell's mana value.
//
// Whether it was kicked is read as the enters trigger resolves (its last-known information
// if it has left), which sets up the delayed trigger that copies once or twice.

const TEXT =
  "When this creature enters, copy the next instant or sorcery spell with mana value 2 or less you cast this turn when you cast it. If this creature was kicked, copy that spell twice instead. You may choose new targets for the copies.";

const NEXT: CardFilter = { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 2 } };

export default defineCard({
  name: "Sea Gate Stormcaller",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: `Kicker {4}{U}\n${TEXT}`,
  kicker: { cost: "{4}{U}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-kicked" },
        then: {
          kind: "delayed-trigger",
          at: { nextSpell: NEXT },
          effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: 2 },
          text: "Copy that spell twice. You may choose new targets for the copies.",
        },
        else: {
          kind: "delayed-trigger",
          at: { nextSpell: NEXT },
          effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
          text: "Copy that spell. You may choose new targets for the copy.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
