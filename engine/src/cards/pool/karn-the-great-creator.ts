import { defineCard } from "../define.js";

// "Becomes an artifact creature" has no "in addition": its card types are
// replaced (rule 205.1a), so an artifact land stops being a land. The amount
// is read once, as the ability resolves (rule 608.2h).
const STATIC_TEXT = "Activated abilities of artifacts your opponents control can't be activated.";
const PLUS_TEXT =
  "+1: Until your next turn, up to one target noncreature artifact becomes an artifact creature with power and toughness each equal to its mana value.";
const MINUS_TEXT =
  "−2: You may reveal an artifact card you own from outside the game or choose a face-up artifact card you own in exile. Put that card into your hand.";

export default defineCard({
  name: "Karn, the Great Creator",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Karn"],
  loyalty: 5,
  text: `${STATIC_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", abilitiesOf: { type: "artifact", controlledBy: "you" } },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } } }],
      effect: {
        kind: "become",
        target: 0,
        setTypes: ["artifact", "creature"],
        power: { manaValueOf: 0 },
        toughness: { manaValueOf: 0 },
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "artifact" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
        outside: "only",
        faceUpExile: true,
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
