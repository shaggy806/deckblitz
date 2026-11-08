import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 9993.
//
// Rulings:
//   [2025-07-25] The cost of the activated ability granted by The Dominion Bracelet is locked in
//     before costs are paid. For example, if the power of the equipped creature is 3 (including
//     the +1/+1 granted by The Dominion Bracelet’s ability), the granted ability will cost {12} to
//     activate.
//   [2025-07-25] You only control the player. You don’t control any of that player’s permanents,
//     spells, or abilities.
//   [2025-07-25] If the targeted player skips their next turn, you’ll control the next turn the
//     affected player actually takes.
//   [2025-07-25] You can’t make any illegal decisions or illegal choices—you can’t do anything
//     that player couldn’t do. You can’t make choices or decisions for that player that aren’t
//     called for by the game rules or by any cards, permanents, spells, abilities, and so on. If
//     an effect causes another player to make decisions that the affected player would normally
//     make (such as Master Warcraft does), that effect takes precedence. In other words, if the
//     affected player wouldn’t make a decision, you wouldn’t make that decision on that player’s
//     behalf.
//   [2025-07-25] You can’t make the affected player concede. That player may choose to concede at
//     any time, even while you’re controlling that player.
//   [2025-07-25] You also can’t make any choices or decisions for the player that would be called
//     for by the tournament rules (such as whether to take an intentional draw or whether to call
//     a judge).
//   [2025-07-25] Multiple player-controlling effects that affect the same player overwrite each
//     other. The last one to be created is the one that works.
//   [2025-07-25] You can use only the affected player’s resources (cards, mana, and so on) to pay
//     costs for that player; you can’t use your own. Similarly, you can use the affected player’s
//     resources only to pay that player’s costs; you can’t spend them on your costs.
//   [2025-07-25] The player you’re controlling is still the active player during that turn.
//   [2025-07-25] While controlling another player, you also continue to make your own choices and
//     decisions.
//   [2025-07-25] While controlling another player, you make all choices and decisions that player
//     is allowed to make or is told to make during that turn. This includes choices about what
//     spells to cast or what abilities to activate, as well as any decisions called for by
//     triggered abilities or for any other reason.

export default defineCard({
  name: "The Dominion Bracelet",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1 and has \"{15}, Exile The Dominion Bracelet: You control target opponent during their next turn. This ability costs {X} less to activate, where X is this creature's power. Activate only as a sorcery.\" (You see all cards that player could see and make all decisions for them.)\nEquip {1}",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  // TODO(scaffold): Equipped creature gets +1/+1 and has "{15}, Exile The Dominion Bracelet: You control target opponent during their next turn. This ability costs {X} less to activate, where X is this creature's power. Activate only as a sorcery."
});
