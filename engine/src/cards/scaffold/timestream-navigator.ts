import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 5354.
//
// Rulings:
//   [2018-01-19] A permanent is any object on the battlefield, including tokens and lands. Spells
//     and emblems aren't permanents.
//   [2018-01-19] If you cast a spell with ascend, you don't get the city's blessing until it
//     resolves. Players may respond to that spell by trying to change whether you get the city's
//     blessing.
//   [2018-01-19] Once you have the city's blessing, you have it for the rest of the game, even if
//     you lose control of some or all of your permanents. The city's blessing isn't a permanent
//     itself and can't be removed by any effect.
//   [2018-01-19] Ascend on a permanent isn't a triggered ability and doesn't use the stack.
//     Players can respond to a spell that will give you your tenth permanent, but they can't
//     respond to getting the city's blessing once you control that tenth permanent. This means
//     that if your tenth permanent is a land you play, players can't respond before you get the
//     city's blessing.
//   [2018-01-19] If your tenth permanent enters the battlefield and then a permanent leaves the
//     battlefield immediately afterwards (most likely due to the "Legend Rule" or due to being a
//     creature with 0 toughness), you get the city's blessing before it leaves the battlefield.
//   [2018-01-19] If you control ten permanents but don't control a permanent or resolving spell
//     with ascend, you don't get the city's blessing. For example, if you control ten permanents,
//     lose control of one, then cast Golden Demise, you won't have the city's blessing and the
//     spell will affect creatures you control.

export default defineCard({
  name: "Timestream Navigator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n{2}{U}{U}, {T}, Put this creature on the bottom of its owner's library: Take an extra turn after this one. Activate only if you have the city's blessing.",
  // TODO(scaffold): {2}{U}{U}, {T}, Put this creature on the bottom of its owner's library: Take an extra turn after this one. Activate only if you have the city's blessing.
});
