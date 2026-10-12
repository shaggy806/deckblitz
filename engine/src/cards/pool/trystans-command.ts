import { defineCard } from "../define.js";

// EDHREC rank 7485.
//
// Rulings:
//   [2025-11-17] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.
//   [2025-11-17] If the copied permanent is copying something else, then the token enters as
//     whatever that permanent copied.
//   [2025-11-17] If all of Trystan's Command's targets are illegal as it tries to resolve, it will
//     do nothing. If at least one target is still legal, it will resolve and do as much as it can.
//   [2025-11-17] If the copied permanent is a token, the token that's created copies the original
//     characteristics of that token as stated by the effect that created that token.
//   [2025-11-17] The token created by the first mode of Trystan's Command copies exactly what was
//     printed on the original permanent and nothing else (unless that permanent is copying
//     something else or is a token; see below). It doesn't copy whether that permanent is tapped
//     or untapped, whether it has any counters on it or Auras and Equipment attached to it, or any
//     non-copy effects that have changed its power, toughness, types, color, and so on.
//   [2025-11-17] If the copied permanent has {X} in its mana cost, X is 0.
//   [2025-11-17] Some older cards were originally printed with the "tribal" card type. That card
//     type has been replaced with "kindred." This change does not affect the gameplay function of
//     these cards.
//   [2025-11-17] Kindred is a card type that allows noncreature cards to have creature types. For
//     example, Morcant's Eyes is an Elf (although not a creature) while on the battlefield and an
//     Elf card (although not a creature card) in zones other than the battlefield.
//   [2025-11-17] Any enters abilities of the copied permanent will trigger when the token enters.
//     Any "as [this permanent] enters" or "[this permanent] enters with" abilities of the copied
//     permanent will also work.

// Ashling's Command's shape. "Target Elf you control" is any Elf permanent, a
// kindred one too; "permanent card" is Nature's Spiral's not-instant-or-
// sorcery. The two returns are one move (Archenemy's Charm). "Untap them" is
// Great Oak Guardian's: the creatures that player controls as it resolves.
const PERMANENT_CARD = { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } } as const;

export default defineCard({
  name: "Trystan's Command",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["kindred", "sorcery"],
  subtypes: ["Elf"],
  text:
    "Choose two —\n" +
    "• Create a token that's a copy of target Elf you control.\n" +
    "• Return one or two target permanent cards from your graveyard to your hand.\n" +
    "• Destroy target creature or enchantment.\n" +
    "• Creatures target player controls get +3/+3 until end of turn. Untap them.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Create a token that's a copy of target Elf you control.",
        targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Elf" } }],
        effect: { kind: "create-token-copy", of: 0, count: 1 },
      },
      {
        text: "Return one or two target permanent cards from your graveyard to your hand.",
        targets: [PERMANENT_CARD, { kind: "optional", of: { kind: "other", of: PERMANENT_CARD, than: { slot: 0 } } }],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0, from: "graveyard" },
            { kind: "return-to-hand", target: 1, from: "graveyard" },
          ],
        },
      },
      {
        text: "Destroy target creature or enchantment.",
        targets: ["creature-or-enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Creatures target player controls get +3/+3 until end of turn. Untap them.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature" },
              controlledByTarget: 0,
              power: 3,
              toughness: 3,
              duration: "end-of-turn",
            },
            { kind: "untap-all", filter: { type: "creature" }, controlledByTarget: 0 },
          ],
        },
      },
    ],
  },
});
