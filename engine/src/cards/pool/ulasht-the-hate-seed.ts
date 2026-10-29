import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 13075.
//
// One counter per other red creature plus one per other green creature, so a
// red-and-green one gives two (the ruling). The mode is chosen as the
// ability is activated, with its own target (rule 700.2b).
const ENTERS_TEXT =
  "Ulasht enters with a +1/+1 counter on it for each other red creature you control and a +1/+1 counter on it for each other green creature you control.";

export default defineCard({
  name: "Ulasht, the Hate Seed",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hellion", "Hydra"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n{1}, Remove a +1/+1 counter from Ulasht: Choose one —\n• Ulasht deals 1 damage to target creature.\n• Create a 1/1 green Saproling creature token.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            sum: [
              { countOf: { type: "creature", controlledBy: "you", colors: ["R"] }, excludeSelf: true },
              { countOf: { type: "creature", controlledBy: "you", colors: ["G"] }, excludeSelf: true },
            ],
          },
        },
      },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Ulasht deals 1 damage to target creature.",
            targets: ["creature"],
            effect: { kind: "damage", amount: 1, target: 0 },
          },
          {
            text: "Create a 1/1 green Saproling creature token.",
            effect: { kind: "create-token", token: "Saproling Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from Ulasht: Choose one —\n• Ulasht deals 1 damage to target creature.\n• Create a 1/1 green Saproling creature token.",
    },
  ],
});
