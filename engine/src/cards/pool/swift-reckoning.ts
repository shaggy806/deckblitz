import { defineCard } from "../define.js";

// Spell mastery as a conditional flash (`flashIf` with a `condition`, rule
// 601.3d): two or more instant and/or sorcery cards in its caster's
// graveyard as the cast begins.
export default defineCard({
  name: "Swift Reckoning",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashIf: { condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } } },
  text: "Spell mastery — If there are two or more instant and/or sorcery cards in your graveyard, you may cast this spell as though it had flash. (You may cast it any time you could cast an instant.)\nDestroy target tapped creature.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
