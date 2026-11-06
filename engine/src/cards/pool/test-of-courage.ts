import { defineCard } from "../define.js";

const ALTER = "Alter the Past — Exile target card from a graveyard. You gain 2 life.";
const OBLITERATE =
  "Obliterate the Transwarp Network — Destroy target artifact or enchantment with mana value 3 or less.";

export default defineCard({
  name: "Test of Courage",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${ALTER}\n• ${OBLITERATE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: ALTER,
        targets: [{ kind: "card-in-graveyard", whose: "any" }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            { kind: "gain-life", amount: 2 },
          ],
        },
      },
      {
        text: OBLITERATE,
        targets: [
          {
            kind: "permanent",
            filter: { typesAnyOf: ["artifact", "enchantment"], manaValue: { op: "lte", n: 3 } },
          },
        ],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
