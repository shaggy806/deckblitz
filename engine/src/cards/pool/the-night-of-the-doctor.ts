import { defineCard } from "../define.js";

// Chapter II's counter is put on the creature after it has entered (Call a
// Surprise Witness's shape: target 0 follows the card onto the battlefield),
// its kind chosen as the chapter resolves (Assaultron Dominator's modal).

const I_TEXT = "I — Destroy all creatures.";
const II_TEXT =
  "II — Return target legendary creature card from your graveyard to the battlefield. Put your choice of a first strike, vigilance, or lifelink counter on it.";

export default defineCard({
  name: "The Night of the Doctor",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after II.)\n${I_TEXT}\n${II_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature" } },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", supertype: "legendary" } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              {
                text: "A first strike counter",
                effect: { kind: "add-counter", target: 0, counter: "first-strike", amount: 1 },
              },
              {
                text: "A vigilance counter",
                effect: { kind: "add-counter", target: 0, counter: "vigilance", amount: 1 },
              },
              {
                text: "A lifelink counter",
                effect: { kind: "add-counter", target: 0, counter: "lifelink", amount: 1 },
              },
            ],
          },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
  ],
});
