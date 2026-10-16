import { defineCard } from "../define.js";

// Its ruling: if Krenko dies at the same time as artifacts go to the
// graveyard, the last ability still triggers for each of them (it looks back).

const COUNTERS = "{T}, Sacrifice an artifact: Put a +1/+1 counter on each Goblin you control.";
const GOBLIN =
  "Whenever an artifact is put into a graveyard from the battlefield, you may pay {R}. If you do, create a 1/1 red Goblin creature token. It gains haste until end of turn.";

export default defineCard({
  name: "Krenko, Baron of Tin Street",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${COUNTERS}\n${GOBLIN}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "add-counter-all", filter: { subtype: "Goblin", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTERS,
    },
  ],
  triggered: [
    {
      // "Put into a graveyard from the battlefield" is "dies" for any
      // permanent (Fangren Marauder's shape), anyone's artifact.
      trigger: { on: "dies", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R} to create a 1/1 red Goblin creature token with haste until end of turn?",
        cost: "{R}",
        effect: { kind: "create-token", token: "Goblin Token", count: 1, gainUntilEndOfTurn: ["haste"] },
      },
      resolve: null,
      text: GOBLIN,
    },
  ],
});
