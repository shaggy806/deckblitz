import { defineCard } from "../define.js";

// Playtest card. Beast Within's shape: the destroyed land's controller gets a
// token that's a copy of the card Mana Confluence (the ruling) — the
// "Mana Confluence Token" key, named Mana Confluence.

const TEXT =
  '{T}: Destroy target nontoken land. Its controller creates a Mana Confluence token. (It\'s a land with "{T}, Pay 1 life: Add one mana of any color.")';

export default defineCard({
  name: "Dwarven Confluencer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "land", token: false } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "create-token", token: "Mana Confluence Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
