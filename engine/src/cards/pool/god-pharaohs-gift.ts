import { defineCard } from "../define.js";

// Rulings:
//   [2017-07-14] The token copies exactly what was printed on the original card and nothing else,
//     except the characteristics it specifically modifies.
//   [2017-07-14] The ability doesn't target the creature card you'll exile. You choose one as the
//     ability resolves.
//   [2017-07-14] The token is a Zombie instead of its other types and is black instead of its other
//     colors. Its power and toughness are 4/4. These are copiable values of the token.
//   [2017-07-14] Unlike the tokens created by an eternalize ability, this token has the mana cost
//     and thus mana value of the card it's copying.
// The card is chosen as the trigger resolves (a `look-and-choose` over the
// graveyard, not a target), and the copy is of that card as it is in exile
// (`asCard`), Hashaton's exceptions; the haste is an until-end-of-turn gain,
// not a copiable value.

const TEXT =
  "At the beginning of combat on your turn, you may exile a creature card from your graveyard. If you do, create a token that's a copy of that card, except it's a 4/4 black Zombie. It gains haste until end of turn.";

export default defineCard({
  name: "God-Pharaoh's Gift",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile a creature card from your graveyard to create a 4/4 black Zombie token copy of it?",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          min: 1,
          max: 1,
          filter: { type: "creature" },
          destination: "exile",
          unlinked: true,
          leftover: "stay",
          then: {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            asCard: true,
            gainUntilEndOfTurn: ["haste"],
            exceptions: { setColors: ["B"], setSubtypes: ["Zombie"], basePt: [4, 4] },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
