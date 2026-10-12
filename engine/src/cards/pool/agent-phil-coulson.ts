import { defineCard } from "../define.js";

// EDHREC rank 10561. Marvel Super Heroes.
//
// "Each other Hero you control" is every Hero permanent but this one, counted
// as the ability resolves (`exceptSource`, Finneas's shape).

const TAP_TEXT = "{T}: Put a +1/+1 counter on each other Hero you control.";

export default defineCard({
  name: "Agent Phil Coulson",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Hero", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
