import { defineCard } from "../define.js";

// EDHREC rank 26105.
//
// Rulings:
//   [2008-10-01] A maximum of one nonbanding creature can join an attacking band no matter how
//     many creatures with banding are in it.
//   [2008-10-01] Creatures in the same band must all attack the same player or planeswalker.
//   [2008-10-01] If a creature with banding attacks, it can team up with any number of other
//     attacking creatures with banding (and up to one nonbanding creature) and attack as a unit
//     called a "band." The band can be blocked by any creature that could block a single creature
//     in the band. Blocking any creature in a band blocks the entire band. If a creature with
//     banding is blocked, the attacking player chooses how the blockers' damage is assigned.
//   [2009-10-01] If a creature in combat has banding, its controller assigns damage for creatures
//     blocking or blocked by it.
//   [2016-06-08] Activated abilities contain a colon. They're generally written "[Cost]:
//     [Effect]." Some keywords are activated abilities and will have colons in their reminder
//     text.

export default defineCard({
  name: "Ayesha Tanaka",
  manaCost: "{W}{W}{U}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  keywords: ["banding"],
  text: "Banding (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)\n{T}: Counter target activated ability from an artifact source unless that ability's controller pays {W}. (Mana abilities can't be targeted.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "ability", abilityKind: "activated", sourceTypes: ["artifact"] }],
      effect: { kind: "unless", chooser: 0, options: [{ pay: "{W}", text: "Pay {W}" }], otherwise: { kind: "counter", target: 0 } },
      resolve: null,
      text: "{T}: Counter target activated ability from an artifact source unless that ability's controller pays {W}.",
    },
  ],
});
