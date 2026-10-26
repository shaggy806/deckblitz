import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] Each of these Equipment has two subtypes listed on its type line. The first one
//     is a creature type, which in this case is also a subtype of kindred. The second one is
//     Equipment, which is a subtype of artifact.
//   [2008-04-01] Each of these Equipment has a triggered ability that says "Whenever a [creature
//     type] creature enters, you may attach [this Equipment] to it." This triggers whenever any
//     creature of the specified creature type enters, no matter who controls it. You may attach
//     your Equipment to another player's creature this way, even though you can't do so with the
//     equip ability.
//   [2008-04-01] If you attach an Equipment you control to another player's creature, you retain
//     control of the Equipment, but you don't control the creature. Only you can activate the
//     Equipment's equip ability, and if the Equipment's ability triggers again, you choose whether
//     to move the Equipment. Only the creature's controller can activate any activated abilities
//     the Equipment grants to the creature, and "you" in any abilities granted to the creature
//     refers to that player.
//   [2024-06-07] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.
//   [2024-06-07] This cards was originally printed with the "tribal" card type. That card type has
//     been replaced with "kindred". This change does not affect the gameplay function of this
//     card.
//   [2024-06-07] Kindred is a card type that allows noncreature cards to have creature types. For
//     example, Echoes of Eternity is an Eldrazi (although not a creature) while on the battlefield
//     and an Eldrazi card (although not a creature card) in zones other than the battlefield.

export default defineCard({
  name: "Obsidian Battle-Axe",
  manaCost: "{3}",
  colors: [],
  types: ["kindred", "artifact"],
  subtypes: ["Warrior", "Equipment"],
  text: "Equipped creature gets +2/+1 and has haste.\nWhenever a Warrior creature enters, you may attach this Equipment to it.\nEquip {3}",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { subtype: "Warrior", type: "creature" },
      },
      targets: [],
      // Any controller's Warrior (its ruling), as Cloak and Dagger's Rogue.
      effect: {
        kind: "may",
        prompt: "Attach Obsidian Battle-Axe to it?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: "Whenever a Warrior creature enters, you may attach this Equipment to it.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantKeywords: ["haste"],
      text: "Equipped creature gets +2/+1 and has haste.",
    },
  ],
});
