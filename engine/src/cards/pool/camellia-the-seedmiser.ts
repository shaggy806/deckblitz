import { defineCard } from "../define.js";
import { forageCost } from "../helpers.js";

// EDHREC rank 2755. "One or more Foods" is one trigger per simultaneous event
// (the sacrifice trigger's `batched`, rule 603.2c): two Foods sacrificed at
// once make one Squirrel, one sacrificed to forage makes one too.
const TRIGGER = "Whenever you sacrifice one or more Foods, create a 1/1 green Squirrel creature token.";
const FORAGE =
  "{2}, Forage: Put a +1/+1 counter on each other Squirrel you control. (To forage, exile three cards from your graveyard or sacrifice a Food.)";

export default defineCard({
  name: "Camellia, the Seedmiser",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warlock"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\nOther Squirrels you control have menace.\n${TRIGGER}\n${FORAGE}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Squirrel" },
      grantKeywords: ["menace"],
      text: "Other Squirrels you control have menace.",
    },
  ],
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Food" }, batched: true },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: 1 },
      resolve: null,
      text: TRIGGER,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, do: forageCost() },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Squirrel", controlledBy: "you" },
        exceptSource: true,
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: FORAGE,
    },
  ],
});
