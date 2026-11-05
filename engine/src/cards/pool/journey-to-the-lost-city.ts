import { defineCard } from "../define.js";

// EDHREC rank 16202. "Those cards" are this upkeep's four; the 20 reads every
// card exiled with it, on earlier upkeeps too.
const UPKEEP_TEXT = "At the beginning of your upkeep, exile the top four cards of your library, then roll a d20.";
const ROW_1 = "1—9 | You may put a land card from among those cards onto the battlefield.";
const ROW_2 = "10—19 | Create a 2/2 green Wolf creature token, then put a +1/+1 counter on it for each creature card among those cards.";
const ROW_3 = "20 | Put all permanent cards exiled with this enchantment onto the battlefield, then sacrifice it.";
const TEXT = `${UPKEEP_TEXT}\n${ROW_1}\n${ROW_2}\n${ROW_3}`;

export default defineCard({
  name: "Journey to the Lost City",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 4, linked: true },
          {
            kind: "roll-dice",
            sides: 20,
            table: [
              {
                min: 1,
                max: 9,
                effect: {
                  kind: "look-and-choose",
                  zone: "exiled-this-way",
                  min: 0,
                  max: 1,
                  filter: { type: "land" },
                  destination: "battlefield",
                  leftover: "stay",
                },
              },
              {
                min: 10,
                max: 19,
                effect: {
                  kind: "create-token",
                  token: "Wolf Token",
                  count: 1,
                  thenCounters: { kind: "+1/+1", amount: { thisWay: "exiled", filter: { type: "creature" } } },
                },
              },
              {
                min: 20,
                effect: {
                  kind: "sequence",
                  effects: [
                    {
                      kind: "return-exiled-by-source",
                      linked: "battlefield",
                      under: "you",
                      filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
                    },
                    { kind: "sacrifice-source" },
                  ],
                },
              },
            ],
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
