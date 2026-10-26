import { defineCard } from "../define.js";

// EDHREC rank 18691. Spell Swindle's counter-then-read-its-mana-value, with
// Convert to Slime's X/X Ooze (its base P/T set as it's made).
//
// Rulings:
//   [2017-03-14] You may target a spell that can’t be countered. When Mystic Genesis resolves, the
//     target spell will be unaffected, but you’ll still get an Ooze token.
//   [2017-03-14] If the target spell is an illegal target when Mystic Genesis tries to resolve,
//     Mystic Genesis won’t resolve and none of its effects will happen. You won’t get an Ooze
//     token.

export default defineCard({
  name: "Mystic Genesis",
  manaCost: "{2}{G}{U}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Counter target spell. Create an X/X green Ooze creature token, where X is that spell's mana value.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "create-token",
        token: "Ooze Token (Convert to Slime)",
        count: 1,
        basePt: { power: { manaValueOf: 0 }, toughness: { manaValueOf: 0 } },
      },
    ],
  },
});
