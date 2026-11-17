import { defineCard } from "../define.js";

// EDHREC rank 13100. The tokens are created attacking whatever their
// controller chooses for each (rule 508.4), as Hero of Bladehold's are.
//
// Rulings:
//   [2022-06-10] If you aren’t in a dungeon when instructed to venture into Undercity, you will
//     put Undercity into the command zone and move your venture marker to Secret Entrance (the
//     first room).
//   [2022-06-10] The initiative is a designation a player can have. A player with the initiative
//     designation is said to “have the initiative.” The initiative carries two inherent rules.
//     First, whenever a player takes the initiative, and at the beginning of the upkeep of the
//     player with the initiative, that player ventures into Undercity. Second, whenever one or
//     more creatures a player controls deal combat damage to the player who has the initiative,
//     the first player takes the initiative. Also, some abilities will refer to having the
//     initiative and provide other benefits.
//   [2022-06-10] A player who currently has the initiative may take the initiative again. This
//     causes that player to venture into Undercity again, but does not cause them to have multiple
//     initiative designations.
//   [2022-06-10] If you’re already in a dungeon when instructed to venture into Undercity, you
//     move to the next room of that dungeon. If you are already in the last room, you will
//     complete that dungeon and start Undercity. This is true whether you’re already in Undercity
//     or any other dungeon.
//   [2022-06-10] There is no initiative in a game until an effect instructs a player to take the
//     initiative. Once a player is instructed to do this, they have the initiative until another
//     player takes the initiative.
//   [2022-06-10] Similarly, when instructed to venture into Undercity, you can’t start a dungeon
//     that isn’t Undercity.
//   [2022-06-10] You cannot venture into Undercity unless instructed to do so, either because you
//     have the initiative at the beginning of your upkeep or because you take the initiative.
//     Notably, if you aren’t in a dungeon and an effect instructs you to venture into the dungeon
//     (not venture into Undercity), you can’t start Undercity.
//   [2022-06-10] If the player with the initiative leaves the game, the active player takes the
//     initiative at the same time that player leaves the game. If the active player is leaving the
//     game or if there is no active player, the next player in turn order takes the initiative.
//   [2022-06-10] In a Two-Headed Giant game, if both players on a team deal combat damage to the
//     player that has the initiative at the same time, the player with the initiative will choose
//     the order of the triggered abilities. Then, as those abilities resolve, one team member
//     takes the initiative (and ventures into Undercity) and then the other team member does the
//     same. The last player to take the initiative keeps it until the initiative changes again.
//   [2022-06-10] Only one player can have the initiative at a time. As one player takes the
//     initiative, any other player that had the initiative ceases to have it.

export default defineCard({
  name: "Undercellar Sweep",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "When this enchantment enters, you take the initiative.\nWhenever you attack, if you or a player you're attacking has the initiative, you create two 1/1 white Soldier creature tokens that are tapped and attacking.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this enchantment enters, you take the initiative.",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      // "A player you're attacking": one a creature of yours attacks now,
      // asked as it triggers and as it resolves (rule 603.4).
      condition: {
        kind: "any",
        of: [
          { kind: "initiative", who: "you" },
          { kind: "of-player", player: "an-attacked-player", condition: { kind: "initiative", who: "you" } },
        ],
      },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 2, tapped: true, attacking: "choose" },
      resolve: null,
      text: "Whenever you attack, if you or a player you're attacking has the initiative, you create two 1/1 white Soldier creature tokens that are tapped and attacking.",
    },
  ],
});
