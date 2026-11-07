import { defineCard } from "../define.js";

// EDHREC rank 5103.
//
// "Exile it, then put it onto the battlefield transformed": the resolving
// spell leaves the stack for exile (`exile` of "source" exiles a spell), and
// the rest of the effect finds it there (rule 400.7j) and puts it onto the
// battlefield back face up (712.14a) — so it never reaches the graveyard or
// flashback's exile as the spell finishes (608.2n). A copy of it wasn't cast,
// so the condition is false for one.
//
// Rulings:
//   [2025-06-06] A nonmodal double-faced card enters with its front face up by default, unless a
//     spell or ability instructs you to put it onto the battlefield transformed or allows you to
//     cast it transformed, in which case it enters with its back face up.
//   [2025-06-06] A sorcery can't be put onto the battlefield and a permanent can't transform into
//     a sorcery. If an effect exiles Summon: Esper Maduin and then instructs you to return it to
//     the battlefield, it remains face up in exile (unless that effect instructs you to put it
//     onto the battlefield transformed, in which case it returns as Summon: Esper Maduin). If an
//     effect instructs you to transform Summon: Esper Maduin, the instruction is ignored.
//   [2025-06-06] Finality counters work on any permanent, not only creatures. If a permanent with
//     a finality counter on it would be put into a graveyard from the battlefield, exile it
//     instead.
//   [2025-06-06] Each nonmodal double-faced card in this release is cast face up. In every zone
//     other than the battlefield, consider only the characteristics of its front face. If it is on
//     the battlefield, consider only the characteristics of the face that's up; the other face's
//     characteristics are ignored.
//   [2025-06-06] In the Commander variant, a double-faced card's color identity is determined by
//     the mana costs and mana symbols in the rules text of both faces combined. If either face has
//     a color indicator or basic land type, those are also considered. For example, Cecil, Dark
//     Knight's color identity is black and white, since its front face is black and its back face
//     has a white color indicator.
//   [2025-06-06] Summon: Esper Maduin's second chapter ability isn't a mana ability. It uses the
//     stack and can be responded to.
//   [2025-06-06] The back face of a nonmodal double-faced card usually has a color indicator that
//     defines its color.
//   [2025-06-06] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2025-06-06] Multiple finality counters on a single permanent are redundant.
//   [2025-06-06] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2025-06-06] "Flashback [cost]" means "You may cast this card from your graveyard if the
//     resulting spell is an instant or sorcery spell by paying [cost] rather than paying its mana
//     cost" and "If the flashback cost was paid, exile this card instead of putting it anywhere
//     else any time it would leave the stack."
//   [2025-06-06] Finality counters aren't keyword counters, and a finality counter doesn't give
//     any abilities to the permanent it's on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.
//   [2025-06-06] A token that is created as a copy of a double-faced permanent or a double-faced
//     card in another zone is a double-faced token. It will have both the front face and back face
//     of whatever object it's copying. If it's copying a double-faced permanent whose back face is
//     up, the token will enter with its back face up. It can transform if instructed to do so.
//   [2025-06-06] Each face of a nonmodal double-faced card has its own set of characteristics:
//     name, types, subtypes, abilities, and so on. While a nonmodal double-faced permanent is on
//     the battlefield, consider only the characteristics of the face that's currently up. The
//     other set of characteristics is ignored.
//   [2025-06-06] Finality counters don't stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner's hand from the battlefield, it does so normally.
//   [2025-06-06] To determine the total cost of a spell, start with the mana cost or alternative
//     cost (such as a flashback cost) you're paying, add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined only by its mana cost, no matter what
//     the total cost to cast the spell was.
//   [2025-06-06] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2025-06-06] The mana value of a nonmodal double-faced card is the mana value of its front
//     face, no matter which face is up.
//   [2025-06-06] You can cast a spell using flashback even if it was somehow put into your
//     graveyard without having been cast.
//   [2025-06-06] If you are instructed to put a card that isn't a double-faced card onto the
//     battlefield transformed, it will not enter at all. In that case, it stays in the zone it was
//     previously in. For example, if a single-faced card is a copy of Crystal Fragments, it will
//     be exiled during the resolution of its second ability and remain in exile.

export default defineCard({
  name: "Esper Origins",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{3}{G}" },
  text: "Surveil 2. You gain 2 life. If this spell was cast from a graveyard, exile it, then put it onto the battlefield transformed under its owner's control with a finality counter on it. (If a creature with a finality counter on it would die, exile it instead.)\nFlashback {3}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  faces: ["Esper Origins", "Summon: Esper Maduin"],
  transform: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "surveil", amount: 2 },
      { kind: "gain-life", amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "graveyard" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "source" },
            {
              kind: "put-onto-battlefield",
              target: "source",
              transformed: true,
              withCounters: { kind: "finality", amount: 1 },
            },
          ],
        },
      },
    ],
  },
});
