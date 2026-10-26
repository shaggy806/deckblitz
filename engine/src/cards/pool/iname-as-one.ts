import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 22827.
//
// Rulings:
//   [2005-06-01] Iname can target itself with the graveyard-triggered ability, but it will be
//     exiled and the ability won't be able to return Iname.
//   [2005-06-01] Effects that put Iname onto the battlefield don't cause its "enters" ability to
//     trigger.
//   [2005-06-01] You aren't required to exile Iname. If you don't, the target Spirit card isn't
//     returned to the battlefield.
//   [2013-07-01] In a Commander game where this card is your commander, casting it from the
//     Command zone does not count as casting it from your hand.
//   [2013-09-20] If a creature (such as Clone) enters the battlefield as a copy of this creature,
//     the copy's "enters-the-battlefield" ability will still trigger as long as you cast that
//     creature spell from your hand.
//   [2021-06-18] If Iname is your commander in a game of Commander, you may choose to put it in
//     the command zone after it dies, but if you do, you won't be able to exile it. If you do
//     exile it, you may put it into the command zone from exile after resolving its ability.
//
// "If you cast it from your hand" is an intervening if on the source (Herald of the Forgotten's
// shape, with `castFrom: "hand"` — the command zone isn't the hand). The dies trigger is
// Greenwarden of Murasa's "you may exile it. If you do": the target may be Iname itself, which
// the exile then moves out of the graveyard, so the return finds nothing (the ruling).

const ENTER_TEXT =
  "When Iname as One enters, if you cast it from your hand, you may search your library for a Spirit permanent card, put it onto the battlefield, then shuffle.";
const DIES_TEXT =
  "When Iname as One dies, you may exile it. If you do, return target Spirit permanent card from your graveyard to the battlefield.";
const SPIRIT_PERMANENT_CARD = { subtype: "Spirit", notTypes: ["instant", "sorcery"] } as const;

export default defineCard({
  name: "Iname as One",
  manaCost: "{8}{B}{B}{G}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 8,
  toughness: 8,
  text: `${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Spirit permanent card?",
        effect: {
          kind: "search-library",
          filter: SPIRIT_PERMANENT_CARD,
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: SPIRIT_PERMANENT_CARD }],
      effect: {
        kind: "may",
        prompt: "Exile Iname as One to return target Spirit permanent card from your graveyard to the battlefield?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: { kind: "put-onto-battlefield", target: 0 },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
