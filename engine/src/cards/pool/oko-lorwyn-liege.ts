import { defineCard } from "../define.js";

// EDHREC rank 13038.
//
// Rulings:
//   [2025-11-17] Each nonmodal double-faced card in this release is cast face up. In every zone
//     other than the battlefield, consider only the characteristics of its front face. If it is on
//     the battlefield, consider only the characteristics of the face that's up; the other face's
//     characteristics are ignored.
//   [2025-11-17] In the Commander variant, a double-faced card's color identity is determined by
//     the mana costs and mana symbols in the rules text of both faces combined. If either face has
//     a color indicator or basic land type, those are also considered. For example, Oko, Lorwyn
//     Liege's color identity is green and blue, since its front face is blue, its rules text
//     contains a green mana symbol, and its back face has a green color indicator as well as a
//     blue mana symbol in its rules text.
//   [2025-11-17] A nonmodal double-faced card enters with its front face up by default, unless a
//     spell or ability instructs you to put it onto the battlefield transformed or allows you to
//     cast it transformed, in which case it enters with its back face up.
//   [2025-11-17] The back face of a nonmodal double-faced card usually has a color indicator that
//     defines its color.
//   [2025-11-17] In some rare cases, this permanent might transform while its triggered ability
//     that allows you to pay mana to transform it is still on the stack. (For example, another
//     effect might cause that ability to trigger an additional time.) In such a case, even if you
//     pay mana as the triggered ability resolves, this permanent won't transform because it
//     already transformed while the triggered ability was on the stack.
//   [2025-11-17] Each face of a nonmodal double-faced card has its own set of characteristics:
//     name, types, subtypes, abilities, and so on. While a double-faced permanent is on the
//     battlefield, consider only the characteristics of the face that's currently up. The other
//     set of characteristics is ignored.
//   [2025-11-17] If you are instructed to put a card that isn't a double-faced card onto the
//     battlefield transformed, it will not enter at all.
//   [2025-11-17] The effect of Oko, Lorwyn Liege's first loyalty ability lasts indefinitely. It
//     doesn't expire during the cleanup step or when Oko leaves the battlefield or transforms.
//   [2025-11-17] The mana value of a nonmodal double-faced card is the mana value of its front
//     face, no matter which face is up.
//   [2025-11-17] A token that is created as a copy of a double-faced permanent or a double-faced
//     card in another zone is a double-faced token. It will have both the front face and back face
//     of whatever object it's copying. If it's copying a double-faced permanent whose back face is
//     up, the token will enter with its back face up. It can transform if instructed to do so.
//
// A transforming double-faced planeswalker (Ashling, Rekindled's shape); the
// back face is Oko, Shadowmoor Scion. "Your first main phase" is the precombat
// main phase. The +2's "gains all creature types" is a layer-4 `add-types`
// with no end (the ruling: it outlasts Oko leaving or transforming).
const TRANSFORM_TEXT = "At the beginning of your first main phase, you may pay {G}. If you do, transform Oko.";
const PLUS_TWO_TEXT = "+2: Up to one target creature gains all creature types. (This effect doesn't end.)";
const PLUS_ONE_TEXT = "+1: Target creature gets -2/-0 until your next turn.";

export default defineCard({
  name: "Oko, Lorwyn Liege",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Oko"],
  loyalty: 3,
  text: `${TRANSFORM_TEXT}\n${PLUS_TWO_TEXT}\n${PLUS_ONE_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-types", target: 0, addSubtypes: ["(every creature type)"], duration: "permanent" },
      resolve: null,
      text: PLUS_TWO_TEXT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "until-your-next-turn" },
      resolve: null,
      text: PLUS_ONE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G} to transform Oko?",
        cost: "{G}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Oko, Lorwyn Liege", "Oko, Shadowmoor Scion"],
  transform: true,
});
