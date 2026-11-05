import { defineCard } from "../define.js";

const TRAMPLE_TEXT = "Each creature that's attacking one of your opponents has trample.";
const PUT_TEXT =
  "{G}, {T}: You may put a creature or Vehicle card from your hand onto the battlefield. If you put an artifact onto the battlefield this way, put two +1/+1 counters on it.";

export default defineCard({
  name: "Oviya, Automech Artisan",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 2,
  text: `${TRAMPLE_TEXT}\n${PUT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attackingOpponent: true } },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
            destination: "battlefield",
            leftover: "stay",
          },
          {
            kind: "add-counter-all",
            filter: { type: "artifact", thisWay: "put-onto-battlefield" },
            counter: "+1/+1",
            amount: 2,
          },
        ],
      },
      resolve: null,
      text: PUT_TEXT,
    },
  ],
});
