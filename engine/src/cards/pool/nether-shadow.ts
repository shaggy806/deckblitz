import { defineCard } from "../define.js";

// EDHREC rank 22160.
//
// Rulings:
//   [2004-10-04] Since it enters due to triggering at the beginning of upkeep, it is not possible
//     to get an infinite loop with four Nether Shadows.
//   [2004-10-04] Note that bringing the Shadow back onto the battlefield from the graveyard is not
//     a spell, it is an ability. It can't be countered with something that counters spells.
//   [2008-10-01] The last thing that happens to a resolving instant or sorcery spell is that it's
//     put into its owner's graveyard. Example: You cast Wrath of God. All creatures on the
//     battlefield are destroyed. You arrange all the cards put into your graveyard this way in any
//     order you want. The other players in the game do the same to the cards that are put into
//     their graveyards. Then you put Wrath of God into your graveyard, on top of the other cards.
//   [2008-10-01] If an effect or rule puts two or more cards into the same graveyard at the same
//     time, the owner of those cards may arrange them in any order.
//   [2008-10-01] Say you're the owner of both a permanent and an Aura that's attached to it. If
//     both the permanent and the Aura are destroyed at the same time (by Akroma's Vengeance, for
//     example), you decide the order they're put into your graveyard. If just the enchanted
//     permanent is destroyed, it's put into your graveyard first. Then, after state-based actions
//     are checked, the Aura (which is no longer attached to anything) is put into your graveyard
//     on top of it.
//   [2008-10-01] A card is "above" another card in your graveyard if it was put into that
//     graveyard later.
//   [2008-10-01] Players may not rearrange the cards in their graveyards.

export default defineCard({
  name: "Nether Shadow",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nAt the beginning of your upkeep, if this card is in your graveyard with three or more creature cards above it, you may put this card onto the battlefield.",
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "source-zone", zones: ["graveyard"], sameObject: true },
          { kind: "cards-in-graveyard", atLeast: 3, filter: { type: "creature", aboveSourceInGraveyard: true } },
        ],
      },
      targets: [],
      effect: { kind: "may", prompt: "Put Nether Shadow onto the battlefield?", effect: { kind: "put-onto-battlefield", target: "source" } },
      resolve: null,
      text: "At the beginning of your upkeep, if this card is in your graveyard with three or more creature cards above it, you may put this card onto the battlefield.",
    },
  ],
});
