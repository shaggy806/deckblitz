import { defineCard } from "../define.js";

// Betrayers of Kamigawa. Each creature you control, Kira among them, has the
// ability itself (rule 113.1): its own first targeting each turn, by anyone's
// spell or ability, counted for that creature whether or not it had the
// ability then, so a creature already targeted this turn gains nothing from
// Kira arriving. The counter is ward's with nothing to pay (rule 701.6a); a
// spell that can't be countered resolves anyway.

const GRANTED_TEXT =
  "Whenever this creature becomes the target of a spell or ability for the first time each turn, counter that spell or ability.";
const STATIC_TEXT = `Creatures you control have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Kira, Great Glass-Spinner",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", firstTimeEachTurn: true },
          targets: [],
          effect: { kind: "ward", cost: null },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
