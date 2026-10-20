import { defineCard } from "../define.js";

const LAND_TEXT = "Whenever a land card is put into your graveyard from anywhere, put a +1/+1 counter on Slogurk.";
const BOUNCE_TEXT = "Remove three +1/+1 counters from Slogurk: Return it to its owner's hand.";
const LEAVES_TEXT =
  "When Slogurk leaves the battlefield, return up to three target land cards from your graveyard to your hand.";

export default defineCard({
  name: "Slogurk, the Overslime",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${LAND_TEXT}\n${BOUNCE_TEXT}\n${LEAVES_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 3 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
  triggered: [
    {
      // Once per land card (tokens aren't cards), from any zone.
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LAND_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }, max: 3 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
        simultaneous: true,
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
