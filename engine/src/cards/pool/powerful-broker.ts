import { defineCard } from "../define.js";

const TEXT =
  "{T}: For each kind of counter on target permanent or player, give that permanent or player another counter of that kind. Activate only as a sorcery.";

export default defineCard({
  name: "Powerful Broker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      sorcerySpeed: true,
      targets: ["permanent-or-player"],
      effect: { kind: "another-counter-of-each-kind", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
