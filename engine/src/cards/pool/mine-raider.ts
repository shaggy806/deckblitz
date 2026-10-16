import { defineCard } from "../define.js";

// EDHREC rank 17823.
//
// Rulings:
//   [2024-04-12] If an ability refers to an outlaw or whether a player controls an outlaw, it's
//     referring only to permanents with one or more of the creature types specified above.
//     Notably, it's not referring to any spell or card not on the battlefield. However, other
//     abilities may refer to an "outlaw spell" or "outlaw card" in a zone other than the
//     battlefield. Those abilities refer to spells and cards with one or more of the specified
//     creature types.
//   [2024-04-12] Outlaw is not a creature type. If an effect asks you to choose a creature type,
//     you can't choose outlaw.
//   [2024-04-12] A card, spell, or permanent is an outlaw if it has the Assassin, Mercenary,
//     Pirate, Rogue, or Warlock creature type. It doesn't matter if it has more than one of those
//     creature types; as long as it has at least one, it's an outlaw.

const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];

export default defineCard({
  name: "Mine Raider",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, if you control another outlaw, create a Treasure token. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws. A Treasure token is an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // An intervening if (rule 603.4): another outlaw permanent you control,
      // as it enters and again as the ability resolves. It's a Rogue itself.
      condition: { kind: "controls", filter: { subtypes: OUTLAWS }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "When this creature enters, if you control another outlaw, create a Treasure token.",
    },
  ],
});
