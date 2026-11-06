import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const TEXT =
  "Strange new worlds — Whenever Commander Spock enters or attacks, reveal the top card of your library. You may cast that card without paying its mana cost if that spell's mana value is equal to or less than the number of differently named lands you control. If it's a land card, you may put it onto the battlefield tapped. If that card is still on top of your library, draw a card.";

// The revealed card stays on top unless it's cast or put onto the battlefield,
// so "if that card is still on top" is the branch where neither happened — a
// land declined, or a spell not cast (declined, or its mana value too high).
// With no card revealed (an empty library) there is no card on top to draw.
const STRANGE_NEW_WORLDS: EffectSpec = {
  kind: "reveal-top",
  then: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: {} },
    then: {
      kind: "conditional",
      condition: { kind: "target", index: 0, filter: { type: "land" } },
      then: {
        kind: "may",
        prompt: "Put the land onto the battlefield tapped?",
        effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
        else: { kind: "draw", amount: 1 },
      },
      else: {
        kind: "cast-now",
        from: { libraryTop: 1 },
        free: true,
        spell: {
          manaValue: {
            op: "lte",
            n: { amount: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } } },
          },
        },
        else: { kind: "draw", amount: 1 },
      },
    },
  },
};

export default defineCard({
  name: "Commander Spock",
  manaCost: "{2}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Human", "Scientist"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: STRANGE_NEW_WORLDS,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: STRANGE_NEW_WORLDS,
      resolve: null,
      text: TEXT,
    },
  ],
});
