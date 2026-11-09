import { defineCard } from "../define.js";

// Rulings: the token is a 5/5 black Demon creature instead of its other
// types and colours (copiable values); its as-enters abilities work; an {X}
// in the copied card's cost is 0.

const LORD_TEXT = "Demons you control have menace, lifelink, and haste.";
const STARSCOURGE_TEXT =
  "Starscourge — At the beginning of combat on your turn, exile up to one target creature card from a graveyard. If you exiled a card this way, create a token that's a copy of that card, except it's a 5/5 black Demon.";

export default defineCard({
  name: "Ardyn, the Usurper",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Human", "Noble"],
  power: 4,
  toughness: 4,
  text: `${LORD_TEXT}\n${STARSCOURGE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Demon", controlledBy: "you" } },
      grantKeywords: ["menace", "lifelink", "haste"],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "create-token-copy",
              of: 0,
              count: 1,
              who: "you",
              asCard: true,
              exceptions: { setTypes: ["creature"], setSubtypes: ["Demon"], setColors: ["B"], power: 5, toughness: 5 },
            },
          },
        ],
      },
      resolve: null,
      text: STARSCOURGE_TEXT,
    },
  ],
});
