import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 10089.
// Makes Smoke Blessing → "Smoke Blessing Token"; it makes Treasure.
//
// Rulings:
//   [2022-02-18] If a Smoke Blessing that would be created by Smoke Spirits' Aid can't be attached
//     to that creature for any reason, the token isn't created.
//
// One Aura token per target still legal as this resolves, each created attached to its
// creature (`create-token`'s `attachedTo` makes none where it can't enchant — the ruling).

export default defineCard({
  name: "Smoke Spirits' Aid",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "For each of up to X target creatures, create a red Aura enchantment token named Smoke Blessing attached to that creature. Those tokens have enchant creature and \"When enchanted creature dies, it deals 1 damage to its controller and you create a Treasure token.\"",
  targets: [{ kind: "any-number", of: "creature", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "create-token", token: "Smoke Blessing Token", count: 1, attachedTo: 0 },
  },
});
