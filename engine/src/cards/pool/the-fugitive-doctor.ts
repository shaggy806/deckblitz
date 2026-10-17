import { defineCard } from "../define.js";

// EDHREC rank 15104.
//
// Rulings:
//   [2023-10-13] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2023-10-13] If a card has multiple instances of flashback, you may choose any of its
//     flashback costs to pay.
//   [2023-10-13] If you cast an instant or sorcery with {X} in its mana cost this way, you must
//     choose 0 as the value of X. (You still have to pay {2}{R}{G}.)
//   [2023-10-13] If a split card gains flashback, you pay only the cost of the half you're casting.
//   [2023-10-13] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//
// The optional sacrifice and its reflexive trigger are Boilerbilges Ripper's
// shape (the target is chosen only once a Clue is sacrificed); the flashback
// is Archmage's Newt's `grant-flashback` with a fixed `cost`, so a split card
// pays {2}{R}{G} for either half and an {X} spell has no X to pay.
const ENTER_TEXT = "When The Fugitive Doctor enters, investigate.";
const ATTACK_TEXT =
  "Whenever The Fugitive Doctor attacks, you may sacrifice a Clue. When you do, target instant or sorcery card in your graveyard gains flashback {2}{R}{G} until end of turn. (You may cast that card from your graveyard for its flashback cost. Then exile it.)";

export default defineCard({
  name: "The Fugitive Doctor",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { subtype: "Clue" }, text: "Sacrifice a Clue" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["instant-or-sorcery-in-your-graveyard"],
          effect: { kind: "grant-flashback", target: 0, cost: "{2}{R}{G}" },
          text: "When you do, target instant or sorcery card in your graveyard gains flashback {2}{R}{G} until end of turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
