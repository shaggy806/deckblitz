import { defineCard } from "../define.js";

// EDHREC rank 14419. Commander Legends (CMR).
//
// `defenderLife: "most"` is a trigger condition asked as the attack is
// declared, of the attacked *player* only — attacking a planeswalker never
// triggers it (the first two rulings). "That player" is the defending player
// the trigger names.
//
// Rulings:
//   [2020-11-10] Seraphic Greatsword's triggered ability won't trigger if the equipped creature
//     attacks a planeswalker controlled by the player with the most life.
//   [2020-11-10] Once the triggered ability triggers, it doesn't matter what happens to players'
//     life totals before the ability resolves. You'll create an Angel token even if the player the
//     equipped creature attacked doesn't have the most life as the ability resolves.
//   [2020-11-10] Although the Angel token created by the triggered ability is attacking, it was
//     never declared as an attacking creature (for the purposes of abilities that trigger whenever
//     a creature attacks, for example).

const ATTACK_TEXT =
  "Whenever equipped creature attacks the player with the most life or tied for most life, create a 4/4 white Angel creature token with flying that's tapped and attacking that player.";

export default defineCard({
  name: "Seraphic Greatsword",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+2.\n${ATTACK_TEXT}\nEquip {4}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached", defenderLife: "most" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "4/4 Angel Token",
        count: 1,
        tapped: true,
        attacking: { player: "trigger-player" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
