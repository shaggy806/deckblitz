import { defineCard } from "../define.js";

const GRANTED =
  "Whenever this creature attacks, create a 4/4 white Angel creature token with flying that's tapped and attacking. Exile that token at end of combat.";
const STATIC_TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Invocation of Saint Traft",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "create-token", token: "4/4 Angel Token", count: 1, tapped: true, attacking: "choose" },
              {
                kind: "delayed-trigger",
                at: "end-of-combat",
                about: "created",
                effect: { kind: "exile", target: 0 },
                text: "Exile that token.",
              },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
