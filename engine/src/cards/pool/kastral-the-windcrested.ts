import { defineCard } from "../define.js";

export default defineCard({
  name: "Kastral, the Windcrested",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever one or more Birds you control deal combat damage to a player, choose one —\n• You may put a Bird creature card from your hand or graveyard onto the battlefield with a finality counter on it.\n• Put a +1/+1 counter on each Bird you control.\n• Draw a card.",
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { subtype: "Bird" },
        combat: true,
      },
      targets: [],
      // The mode is chosen as the trigger goes on the stack (rule 700.2b).
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "You may put a Bird creature card from your hand or graveyard onto the battlefield with a finality counter on it.",
            effect: {
              kind: "may",
              prompt: "Put a Bird creature card from your hand or graveyard onto the battlefield?",
              effect: {
                kind: "return-from-graveyard",
                filter: { type: "creature", subtype: "Bird" },
                destination: "battlefield",
                count: 1,
                withCounters: { kind: "finality", amount: 1 },
                from: "hand-or-graveyard",
              },
            },
          },
          {
            text: "Put a +1/+1 counter on each Bird you control.",
            effect: {
              kind: "add-counter-all",
              filter: { subtype: "Bird", controlledBy: "you" },
              counter: "+1/+1",
              amount: 1,
            },
          },
          { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: "Whenever one or more Birds you control deal combat damage to a player, choose one —",
    },
  ],
});
