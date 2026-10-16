import { defineCard } from "../define.js";

// EDHREC rank 19029.
//
// Rulings:
//   [2024-09-20] Some cards in the Duskmourn release have abilities that trigger "whenever you
//     manifest dread." In circumstances where you are instructed to manifest dread but can't
//     perform some or all of the steps of manifesting dread (probably because your library has one
//     or fewer cards in it), these abilities will still trigger.
//   [2024-09-20] If a double-faced card is manifested, it will be put onto the battlefield face
//     down. While face down, it can't transform. If the front face of the card is a creature card,
//     you can turn it face up by paying its mana cost. If you do, its front face will be up.
//   [2024-09-20] Because the permanent is on the battlefield both before and after it's turned
//     face up, turning a permanent face up doesn't cause any enters-the-battlefield abilities to
//     trigger.
//   [2024-09-20] To manifest dread, look at the top two cards of your library. Manifest one (by
//     putting it onto the battlefield face down) and put the other into your graveyard. The card
//     you put onto the battlefield becomes a 2/2 face-down creature with no name, mana cost,
//     creature types, or abilities. It's colorless and has a mana value of 0. Other effects that
//     apply to the permanent can still grant it any characteristics it doesn't have or change the
//     characteristics it does have.
//   [2024-09-20] If a face-down spell leaves the stack and goes to any zone other than the
//     battlefield (if it was countered, for example), you must reveal it. Similarly, if a
//     face-down permanent leaves the battlefield, you must reveal it. You must also reveal all
//     face-down spells and permanents you control if you leave the game or the game ends.
//   [2024-09-20] If a face-down creature loses its abilities, it can't be turned face up with a
//     disguise or morph ability because it will no longer have that ability (or the associated
//     cost) once face up.
//   [2024-09-20] A permanent that turns face up or face down changes characteristics but is
//     otherwise the same permanent. Spells and abilities that were targeting that permanent and
//     Auras and Equipment that were attached to that permanent aren't affected unless the new
//     characteristics of the object change the legality of those targets or attachments.
//   [2024-09-20] If a manifested creature would have disguise or morph if it were face up, you may
//     also turn it face up by paying its disguise or morph cost, as appropriate.
//   [2024-09-20] Because face-down creatures don't have a name, they can't have the same name as
//     any other creature, even another face-down creature.
//   [2024-09-20] At any time, you can look at a face-down spell or permanent you control. You
//     can't look at face-down permanents or spells you don't control unless an effect instructs or
//     allows you to do so.
//   [2024-09-20] If something tries to turn a face-down instant or sorcery card on the battlefield
//     face up, reveal that card to show all players it's an instant or sorcery card. The permanent
//     remains on the battlefield face down. Abilities that trigger when a permanent turns face up
//     won't trigger, because even though you revealed the card, it never turned face up.
//   [2024-09-20] You must ensure that your face-down spells and permanents can be easily
//     differentiated from each other. You're not allowed to mix up the cards that represent them
//     on the battlefield to confuse other players. The order in which they entered should remain
//     clear, as well as what ability caused them to be face down. (This includes manifest,
//     disguise, cloak, morph, and a few older effects that turn cards face down.) Common methods
//     for doing this include using markers or dice, or simply placing them in order on the
//     battlefield.
//   [2024-09-20] Turning a permanent face up or face down doesn't change whether that permanent is
//     tapped or untapped.
//   [2024-09-20] Unlike a face-down creature that was cast using a disguise or morph ability, a
//     manifested creature may still be turned face up after it loses its abilities if it's a
//     creature card.
//   [2024-09-20] If your library contains only one card when you manifest dread, you'll look at
//     that card and put it onto the battlefield face down. You won't have the option to put it
//     into your graveyard instead. If your library contains no cards when you manifest dread, you
//     won't do anything.
//   [2024-09-20] Any time you have priority, you can turn a manifested permanent you control face
//     up by revealing that it's a creature card (ignoring any copy effects or type-changing
//     effects that might be applying to it) and paying its mana cost. This is a special action. It
//     doesn't use the stack and can't be responded to.

const ENTERS =
  "When this creature enters, manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Unsettling Twins",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: "When this creature enters, manifest dread.",
    },
  ],
});
