import { defineCard } from "../define.js";

// EDHREC rank 5171. Trance is Clive, Ifrit's Dominant's flicker; the back
// face, Esper Terra, is in its own file.
//
// Rulings:
//   [2025-06-06] A token that is created as a copy of a double-faced permanent or a double-faced
//     card in another zone is a double-faced token. It will have both the front face and back face
//     of whatever object it's copying. If it's copying a double-faced permanent whose back face is
//     up, the token will enter with its back face up. It can transform if instructed to do so.
//   [2025-06-06] If you are instructed to put a card that isn't a double-faced card onto the
//     battlefield transformed, it will not enter at all. In that case, it stays in the zone it was
//     previously in. For example, if a single-faced card is a copy of Crystal Fragments, it will
//     be exiled during the resolution of its second ability and remain in exile.
//   [2025-06-06] The back face of a nonmodal double-faced card usually has a color indicator that
//     defines its color.
//   [2025-06-06] The token copies exactly what was printed on the original enchantment (unless
//     that enchantment is copying something else or is a token; see below). It doesn't copy
//     whether that enchantment is tapped or untapped, whether it has any counters on it or any
//     Auras or Equipment attached to it, or any non-copy effects that have changed its types,
//     color, power and toughness, and so on.
//   [2025-06-06] Each face of a nonmodal double-faced card has its own set of characteristics:
//     name, types, subtypes, abilities, and so on. While a nonmodal double-faced permanent is on
//     the battlefield, consider only the characteristics of the face that's currently up. The
//     other set of characteristics is ignored.
//   [2025-06-06] If the copied enchantment has {X} in its mana cost, X is 0.
//   [2025-06-06] If the copied enchantment is copying something else, then the token enters as
//     whatever that enchantment copied.
//   [2025-06-06] In the Commander variant, a double-faced card's color identity is determined by
//     the mana costs and mana symbols in the rules text of both faces combined. If either face has
//     a color indicator or basic land type, those are also considered. For example, Cecil, Dark
//     Knight's color identity is black and white, since its front face is black and its back face
//     has a white color indicator.
//   [2025-06-06] Each nonmodal double-faced card in this release is cast face up. In every zone
//     other than the battlefield, consider only the characteristics of its front face. If it is on
//     the battlefield, consider only the characteristics of the face that's up; the other face's
//     characteristics are ignored.
//   [2025-06-06] Esper Terra's fourth chapter ability isn't a mana ability. It uses the stack and
//     can be responded to.
//   [2025-06-06] If the enchantment copied by the token had any "when [this permanent] enters"
//     abilities, the token also has those abilities, and they'll trigger when it's created.
//     Similarly, any "as [this permanent] enters" or "[this permanent] enters with" abilities that
//     the token has copied will also work.
//   [2025-06-06] A nonmodal double-faced card enters with its front face up by default, unless a
//     spell or ability instructs you to put it onto the battlefield transformed or allows you to
//     cast it transformed, in which case it enters with its back face up.
//   [2025-06-06] The mana value of a nonmodal double-faced card is the mana value of its front
//     face, no matter which face is up.
//   [2025-06-06] If the copied enchantment is a token, the new token that's created copies the
//     original characteristics of that token as stated by the effect that created the token.

export default defineCard({
  name: "Terra, Magical Adept",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Warrior"],
  power: 4,
  toughness: 2,
  text: "When Terra enters, mill five cards. Put up to one enchantment card milled this way into your hand.\nTrance — {4}{R}{G}, {T}: Exile Terra, then return it to the battlefield transformed under its owner's control. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{4}{R}{G}", tap: true },
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: "Trance — {4}{R}{G}, {T}: Exile Terra, then return it to the battlefield transformed under its owner's control. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 5 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", type: "enchantment" },
          },
        ],
      },
      resolve: null,
      text: "When Terra enters, mill five cards. Put up to one enchantment card milled this way into your hand.",
    },
  ],
  faces: ["Terra, Magical Adept", "Esper Terra"],
  transform: true,
});
