import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 13001.
//
// Rulings:
//   [2014-02-01] If the target creature is an illegal target as Bile Blight tries to resolve, it
//     won't resolve and none of its effects will happen. No creature will get -3/-3.
//   [2014-02-01] Bile Blight has only one target. Other creatures with that name are not targeted.
//     For example, a creature with hexproof will still get -3/-3 if it has the same name as the
//     target creature.
//   [2022-06-10] Unless a token is a copy of another permanent or was explicitly given a name by
//     the effect that created it, its name is the subtypes it was given when it was created plus
//     the word "Token." For example, if an effect creates a 1/1 Soldier creature token, that token
//     is named "Soldier Token."

export default defineCard({
  name: "Bile Blight",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature and all other creatures with the same name as that creature get -3/-3 until end of turn.",
  // TODO(scaffold): Target creature and all other creatures with the same name as that creature get -3/-3 until end of turn.
});
