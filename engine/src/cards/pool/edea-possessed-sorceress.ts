import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 13884.
//
// - Ward {2}: the `ward` helper.
// - The combat steal is Captivating Crew's threaten, on a beginning-of-combat
//   trigger.
// - "A creature you control but don't own" is Don Andres's filter (`ownedBy:
//   "opponent"`), read off the creature as it last existed; it comes back
//   under its owner's control (Malakir Rebirth's `put-onto-battlefield` of the
//   trigger object, no `underYourControl`). A token doesn't come back (it
//   ceased to exist), but the card is drawn either way.
const STEAL_TEXT =
  "At the beginning of combat on your turn, gain control of target creature an opponent controls until end of turn. Untap that creature. It gains haste until end of turn.";
const RETURN_TEXT =
  "Whenever a creature you control but don't own dies, return it to the battlefield under its owner's control and you draw a card.";

export default defineCard({
  name: "Edea, Possessed Sorceress",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 5,
  text: `Ward {2}\n${STEAL_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: STEAL_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", ownedBy: "opponent" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "trigger-object" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
