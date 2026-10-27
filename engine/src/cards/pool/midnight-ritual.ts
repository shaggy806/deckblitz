import { defineCard } from "../define.js";

export default defineCard({
  name: "Midnight Ritual",
  manaCost: "{X}{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile X target creature cards from your graveyard. For each creature card exiled this way, create a 2/2 black Zombie creature token.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "exile", target: 0 },
        { kind: "create-token", token: "Zombie Token", count: 1 },
      ],
    },
  },
});
