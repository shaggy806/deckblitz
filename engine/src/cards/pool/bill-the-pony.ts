import { defineCard } from "../define.js";

// EDHREC rank 8841.
// Makes Food → use "Food Token".
//
// Rulings:
//   [2023-06-16] Bill the Pony's last ability doesn't actually change any creature's power. It
//     changes only the amount of combat damage it assigns. All other rules and effects that check
//     power or toughness use the real values. For example, since having two creatures fight
//     doesn't result in combat damage, an effect that causes the affected creature to fight
//     another creature will still use its power to determine how much damage is dealt.
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs. For example, you can't
//     sacrifice a Food token to activate its own ability and also to activate Maraleaf Rider's
//     ability.
//   [2024-11-08] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Tough Cookie (an Artifact Creature — Food
//     Golem) to activate Maraleaf Rider's ability (an ability with "Sacrifice a Food" in its
//     cost).
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2024-11-08] Whatever you do, don't eat the delicious cards.

export default defineCard({
  name: "Bill the Pony",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 1,
  toughness: 4,
  text: "When Bill the Pony enters, create two Food tokens. (They're artifacts with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nSacrifice a Food: Until end of turn, target creature you control assigns combat damage equal to its toughness rather than its power.",
  activated: [
    {
      // Walking Bulwark's `damage-by-toughness`: only the combat damage it
      // assigns changes, its power doesn't (the first ruling).
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "artifact", subtype: "Food" } } },
      targets: ["creature-you-control"],
      effect: { kind: "damage-by-toughness", target: 0 },
      resolve: null,
      text: "Sacrifice a Food: Until end of turn, target creature you control assigns combat damage equal to its toughness rather than its power.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 2 },
      resolve: null,
      text: "When Bill the Pony enters, create two Food tokens.",
    },
  ],
});
