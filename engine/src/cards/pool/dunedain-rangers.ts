import { defineCard } from "../define.js";

// EDHREC rank 13048.
//
// Rulings:
//   [2023-06-16] Some spells and abilities that cause the Ring to tempt you may require targets.
//     If each target chosen is an illegal target as that spell or ability tries to resolve, it
//     won't resolve. The Ring won't tempt you.
//   [2023-06-16] The Ring can tempt you even if you don't control a creature. In this case,
//     abilities that trigger "whenever the Ring tempts you" will still trigger.
//   [2023-06-16] Each time the Ring tempts you, you must choose a creature if you control one.
//   [2023-06-16] If the creature you choose as your Ring-bearer was already your Ring-bearer, that
//     still counts as choosing that creature as your Ring-bearer for the purpose of abilities that
//     trigger "whenever you choose a creature as your Ring-bearer" or abilities that care about
//     which creature was chosen as your Ring-bearer.
//   [2023-06-16] As the Ring tempts you, you get an emblem named The Ring if you don't have one.
//     Then your emblem gains its next ability and you choose a creature you control to become (or
//     remain) your Ring-bearer.
//   [2023-06-16] The Ring gains its abilities in order from top to bottom. Once it gains an
//     ability, it has that ability for the rest of the game.
//   [2023-06-16] Each player can have only one emblem named The Ring and only one Ring-bearer at a
//     time.
//   [2024-11-08] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.
//   [2024-11-08] Whenever a land you control enters, each landfall ability of the permanents you
//     control will trigger. You can put them   on the stack in any order. The last ability you put
//     on the stack will be the first one to resolve (As a result, you can have those abilities
//     resolve in the order of your choosing.).
//   [2024-11-08] A landfall ability triggers whenever a land you control enters for any reason. It
//     triggers whenever you play a land, as well as whenever a spell or ability puts a land onto
//     the battlefield under your control.

export default defineCard({
  name: "Dúnedain Rangers",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 4,
  toughness: 4,
  text: "Landfall — Whenever a land you control enters, if you don't control a Ring-bearer, the Ring tempts you.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      // An intervening-if (rule 603.4), asked as the land enters and again as
      // it resolves; the Rangers count if they are the Ring-bearer.
      condition: { kind: "not", of: { kind: "controls", filter: { ringBearer: true }, atLeast: 1 } },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, if you don't control a Ring-bearer, the Ring tempts you.",
    },
  ],
});
