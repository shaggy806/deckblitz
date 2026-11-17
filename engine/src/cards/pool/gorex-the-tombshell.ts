import { defineCard } from "../define.js";

// March of the Machine (MOM). EDHREC rank 11986.
//
// The additional cost is `exileFromGraveyard` of X creature cards, `linked`
// so they're exiled with the permanent Gorex becomes (rule 607.2a), with
// `reducesPerX: 2`: X announced as it's cast (rule 601.2b), any number up to
// the creature cards there — past what lowers the cost further too — and each
// taking {2} of generic mana off the total cost after any increase such as
// commander tax (rule 601.2f; the rulings), never its {B}{B}. Attacking or
// dying, a card exiled with it at random goes to its owner's hand.
//
// Rulings:
//   - Gorex's first ability can't reduce its cost below {B}{B}. You can exile any number of
//     creature cards from your graveyard, even if they won't reduce Gorex's cost any further.
//   - Include any additional costs to cast Gorex before applying its own cost reduction. For
//     example, if Gorex is your commander and an additional cost of {6} applies from the
//     "commander tax," you may cast Gorex by exiling four creature cards from your graveyard and
//     paying {4}{B}{B}.

const COST_TEXT =
  "As an additional cost to cast this spell, you may exile any number of creature cards from your graveyard. This spell costs {2} less to cast for each card exiled this way.";
const RETURN_TEXT =
  "Whenever Gorex attacks or dies, choose a card at random exiled with Gorex and put that card into its owner's hand.";
const RETURN = {
  kind: "choose-random-card",
  zone: "exiled-with-source",
  then: { kind: "return-to-hand", target: 0, from: "exile" },
} as const;

export default defineCard({
  name: "Gorex, the Tombshell",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Turtle"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `${COST_TEXT}\nDeathtouch\n${RETURN_TEXT}`,
  additionalCost: {
    exileFromGraveyard: { count: "x", filter: { type: "creature" }, linked: true },
    reducesPerX: 2,
  },
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: RETURN, resolve: null, text: RETURN_TEXT },
    { trigger: { on: "dies", who: "self" }, targets: [], effect: RETURN, resolve: null, text: RETURN_TEXT },
  ],
});
