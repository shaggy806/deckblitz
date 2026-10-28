import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, return up to X target Zombie cards from your graveyard to the battlefield, where X is the number of opponents you have.";

export default defineCard({
  name: "Rot Hulk",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  text: `Menace\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Zombie" } },
          max: { countPlayers: "each-opponent" },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
