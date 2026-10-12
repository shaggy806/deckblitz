import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 11884.
//
// Rulings:
//   [2025-11-17] The back face of a nonmodal double-faced card usually has a color indicator that
//     defines its color.
//   [2025-11-17] Each nonmodal double-faced card in this release is cast face up. In every zone
//     other than the battlefield, consider only the characteristics of its front face. If it is on
//     the battlefield, consider only the characteristics of the face that's up; the other face's
//     characteristics are ignored.
//   [2025-11-17] The mana value of a nonmodal double-faced card is the mana value of its front
//     face, no matter which face is up.
//   [2025-11-17] If you are instructed to put a card that isn't a double-faced card onto the
//     battlefield transformed, it will not enter at all.
//   [2025-11-17] A token that is created as a copy of a double-faced permanent or a double-faced
//     card in another zone is a double-faced token. It will have both the front face and back face
//     of whatever object it's copying. If it's copying a double-faced permanent whose back face is
//     up, the token will enter with its back face up. It can transform if instructed to do so.
//   [2025-11-17] In the Commander variant, a double-faced card's color identity is determined by
//     the mana costs and mana symbols in the rules text of both faces combined. If either face has
//     a color indicator or basic land type, those are also considered. For example, Oko, Lorwyn
//     Liege's color identity is green and blue, since its front face is blue, its rules text
//     contains a green mana symbol, and its back face has a green color indicator as well as a
//     blue mana symbol in its rules text.
//   [2025-11-17] Each face of a nonmodal double-faced card has its own set of characteristics:
//     name, types, subtypes, abilities, and so on. While a double-faced permanent is on the
//     battlefield, consider only the characteristics of the face that's currently up. The other
//     set of characteristics is ignored.
//   [2025-11-17] A nonmodal double-faced card enters with its front face up by default, unless a
//     spell or ability instructs you to put it onto the battlefield transformed or allows you to
//     cast it transformed, in which case it enters with its back face up.
//   [2025-11-17] In some rare cases, this permanent might transform while its triggered ability
//     that allows you to pay mana to transform it is still on the stack. (For example, another
//     effect might cause that ability to trigger an additional time.) In such a case, even if you
//     pay mana as the triggered ability resolves, this permanent won't transform because it
//     already transformed while the triggered ability was on the stack.
//
// A transforming double-faced card (Ashling, Rekindled's shape); the back face
// is Trystan, Penitent Culler. "Your first main phase" is the precombat main
// phase. "Then if there is an Elf card in your graveyard" is checked after the
// mill, as the ability resolves — not an intervening-if.
const MILL_TEXT =
  "Whenever this creature enters or transforms into Trystan, Callous Cultivator, mill three cards. Then if there is an Elf card in your graveyard, you gain 2 life.";
const TRANSFORM_TEXT = "At the beginning of your first main phase, you may pay {B}. If you do, transform Trystan.";

const MILL: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "mill", target: "you", amount: 3 },
    {
      kind: "conditional",
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Elf" } },
      then: { kind: "gain-life", amount: 2 },
    },
  ],
};

export default defineCard({
  name: "Trystan, Callous Cultivator",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${MILL_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: MILL,
      resolve: null,
      text: MILL_TEXT,
    },
    {
      trigger: { on: "transforms", who: "self", intoFront: true },
      targets: [],
      effect: MILL,
      resolve: null,
      text: MILL_TEXT,
    },
    {
      // Won't transform him if he has transformed since it triggered (the
      // ruling; rule 701.28f).
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to transform Trystan?",
        cost: "{B}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Trystan, Callous Cultivator", "Trystan, Penitent Culler"],
  transform: true,
});
