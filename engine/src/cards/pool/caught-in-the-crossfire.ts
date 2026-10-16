import { defineCard } from "../define.js";

// EDHREC rank 16241.
//
// Rulings:
//   [2024-04-12] If all targets for the chosen modes become illegal before a spell with spree
//     resolves, the spell won’t resolve and none of its effects will happen. If at least one
//     target is still legal, the spell will resolve but will have no effect on any illegal
//     targets.
//   [2024-04-12] You choose the modes as you cast the spell with spree. Once modes are chosen,
//     they can’t be changed.
//   [2024-04-12] If an effect allows you to cast a spell with spree “without paying its mana
//     cost,” you must still choose at least one mode and pay the associated additional costs.
//   [2024-04-12] You can’t choose the same mode more than once.
//   [2024-04-12] Outlaw is not a creature type. If an effect asks you to choose a creature type,
//     you can’t choose outlaw.
//   [2024-04-12] A card, spell, or permanent is an outlaw if it has the Assassin, Mercenary,
//     Pirate, Rogue, or Warlock creature type. It doesn’t matter if it has more than one of those
//     creature types; as long as it has at least one, it’s an outlaw.
//   [2024-04-12] If a mode requires a target, you can select that mode only if there’s a legal
//     target available. Ignore the targeting requirements for modes you don’t choose.
//   [2024-04-12] Spells with spree have a + (plus sign) indicator in the upper right corner of the
//     card frame. This has no rules meaning and serves only to remind players that at least one
//     additional cost is required to cast the spell.
//   [2024-04-12] If an ability refers to an outlaw or whether a player controls an outlaw, it’s
//     referring only to permanents with one or more of the creature types specified above.
//     Notably, it’s not referring to any spell or card not on the battlefield. However, other
//     abilities may refer to an “outlaw spell” or “outlaw card” in a zone other than the
//     battlefield. Those abilities refer to spells and cards with one or more of the specified
//     creature types.
//   [2024-04-12] You must choose at least one of the listed modes and pay its associated
//     additional cost in order to cast a spell with spree.
//   [2024-04-12] No matter which modes you choose, you always follow the instructions in the order
//     they are written.
//   [2024-04-12] If a spell with spree is copied, the effect that creates the copy may allow you
//     to choose new targets. You cannot choose new modes.
//   [2024-04-12] Each additional cost and associated mode in the text box is also preceded with a
//     + indicator. These symbols also have no rules meaning and serve only to remind players that
//     the listed costs are additional costs.
//   [2024-04-12] The mana value of a spell with spree is determined only by its mana cost (in the
//     upper right corner of the card). It doesn’t matter which modes you choose or which
//     additional costs you pay, including any additional costs imposed by other effects.
//   [2024-04-12] No player can cast spells or activate abilities in between the modes of a
//     resolving spell. Any abilities that trigger won’t be put onto the stack until the spell is
//     done resolving.

// Outlaws are the five creature types the reminder text lists (see Vihaan,
// Goldwaker). Each mode is its own sentence, so with both chosen the outlaws
// are dealt their damage first, then the rest (the rulings' printed order).
const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];
const OUTLAW_MODE =
  "+ {1} — Caught in the Crossfire deals 2 damage to each outlaw creature. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)";
const NON_OUTLAW_MODE = "+ {1} — Caught in the Crossfire deals 2 damage to each non-outlaw creature.";

export default defineCard({
  name: "Caught in the Crossfire",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Spree (Choose one or more additional costs.)\n${OUTLAW_MODE}\n${NON_OUTLAW_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: OUTLAW_MODE,
        spreeCost: "{1}",
        targets: [],
        effect: { kind: "damage-all", filter: { type: "creature", subtypes: OUTLAWS }, amount: 2 },
      },
      {
        text: NON_OUTLAW_MODE,
        spreeCost: "{1}",
        targets: [],
        effect: { kind: "damage-all", filter: { type: "creature", notSubtypes: OUTLAWS }, amount: 2 },
      },
    ],
  },
});
