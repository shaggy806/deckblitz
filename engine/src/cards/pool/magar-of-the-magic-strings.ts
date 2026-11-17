import { defineCard } from "../define.js";

// EDHREC rank 11536. Unfinity.
//
// Rulings:
//   [2022-10-07] You may look at face-down permanents you control at any time.
//   [2022-10-07] If a creature enters the battlefield as a copy of a face-down creature (or if a
//     token is created that’s a copy of one), that copy has the same characteristics as the
//     face-down creature (in this case, it’s a 3/3 creature with the two abilities and no other
//     characteristics), even though the copy is face up. Importantly, the noted name is not part
//     of the face-down creature’s copiable values, so copies of the face-down creature won’t know
//     the noted name. If one deals combat damage to a player, its controller won’t create a copy
//     of any card.
//   [2022-10-07] If an effect tries to “blink” a face-down instant or sorcery card—that is, exile
//     it and then return it to the battlefield—the card is exiled and remains in exile.
//   [2022-10-07] The face-down creature has no characteristics other than the ones given to it by
//     Magar’s ability. It has no name, no mana cost, no creature types, and no abilities other
//     than the two Magar gives it. The creature is colorless and has a mana value of 0.
//   [2022-10-07] If a face-down permanent you control leaves the battlefield, or if the game ends
//     or you leave the game while you control it, you must reveal it to all players (even though
//     in this case, everyone saw it before it entered).
//   [2022-10-07] There are no cards in this set that would turn a face-down instant or sorcery
//     card on the battlefield face up, but some older cards can try to do this. If something tries
//     to turn a face-down instant or sorcery card on the battlefield face up, reveal that card to
//     show all players it’s an instant or sorcery card. The permanent remains on the battlefield
//     face down. Abilities that trigger when a permanent turns face up won’t trigger, because even
//     though you revealed the card, it never turned face up.
//
// Rule 707.14: the card's name is noted on the face-down permanent
// (`noteName`, `GameObject.notedName`), whose 3/3 with its two abilities is an
// internal definition (`FaceDownAs` "3/3 creature that copies the noted
// card", `cards/face-down.ts`) — its copiable values, so a Clone of it is that
// 3/3 too, with no noted name and so no copy to make. The copy is made from
// the noted name outside the game (as Garth One-Eye's, rule 707.13) and
// offered free; declining to cast it is declining to make it, the two "may"s
// meaning one choice.
const NOTE_TEXT =
  '{1}{B}{R}: Note the name of target instant or sorcery card in your graveyard and put it onto the battlefield face down. It\'s a 3/3 creature with "Whenever this creature deals combat damage to a player, you may create a copy of the card with the noted name. You may cast the copy without paying its mana cost" and "If this creature would leave the battlefield, exile it instead of putting it anywhere else."';

export default defineCard({
  name: "Magar of the Magic Strings",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Performer"],
  power: 3,
  toughness: 3,
  text: NOTE_TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}{R}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        faceDown: "3/3 creature that copies the noted card",
        noteName: true,
      },
      resolve: null,
      text: NOTE_TEXT,
    },
  ],
});
