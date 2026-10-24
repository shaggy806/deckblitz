import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 26466.
//
// Rulings:
//   [2015-06-22] If some targets become illegal, the original division still applies; no damage is
//     dealt to illegal targets.
//   [2015-06-22] You choose how many targets and how the damage is divided as you cast the spell.
//     Each target must receive at least 1 damage.
//
// Chandra's Pyrohelix's shape over one to three creatures with flying.
export default defineCard({
  name: "Aerial Volley",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Aerial Volley deals 3 damage divided as you choose among one, two, or three target creatures with flying.",
  targets: [
    { kind: "any-number", of: { kind: "permanent", filter: { type: "creature", keyword: "flying" } }, min: 1, max: 3 },
  ],
  divided: { total: 3, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
