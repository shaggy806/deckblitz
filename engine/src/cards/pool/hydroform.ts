import { defineCard } from "../define.js";

// EDHREC rank 27723. Clan Guildmage's land animation, any land.
//
// Rulings:
//   [2013-01-24] Hydroform doesn’t affect the land’s name or any other types, subtypes, or
//     supertypes (such as basic or legendary) the land may have. The land will also keep any
//     abilities it had.
//   [2013-01-24] Effects that modify power and/or toughness but don’t set them to a specific value
//     (like the one created by Giant Growth), power/toughness changes from counters, and effects
//     that switch a creature’s power and toughness will continue to apply. This may happen if the
//     land was already a creature when Hydroform resolved.
//   [2013-01-24] If the target land hasn’t been under its controller’s control continuously since
//     the beginning of their most recent turn, that land won’t be able to attack and its {T}
//     abilities won’t be able to be activated. In most cases, that means it will no longer be able
//     to be tapped for mana that turn.

export default defineCard({
  name: "Hydroform",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Target land becomes a 3/3 Elemental creature with flying until end of turn. It's still a land.",
  targets: ["land"],
  effect: {
    kind: "animate",
    target: 0,
    power: 3,
    toughness: 3,
    addTypes: ["creature"],
    addSubtypes: ["Elemental"],
    keywords: ["flying"],
    duration: "end-of-turn",
  },
});
