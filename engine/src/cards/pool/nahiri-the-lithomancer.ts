import { defineCard } from "../define.js";

// EDHREC rank 9175. +2 is Nahiri, Heir of the Ancients' +1 with a Kor Soldier;
// −2 is Dakkon, Shadow Slayer's −6 for an Equipment card; −10 makes the
// Stoneforged Blade token. "Can be your commander" is read from `text` by
// deck validation (`canBeCommander`).

export default defineCard({
  name: "Nahiri, the Lithomancer",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nahiri"],
  loyalty: 3,
  canBeCommander: true,
  text: "+2: Create a 1/1 white Kor Soldier creature token. You may attach an Equipment you control to it.\n−2: You may put an Equipment card from your hand or graveyard onto the battlefield.\n−10: Create a colorless Equipment artifact token named Stoneforged Blade. It has indestructible, \"Equipped creature gets +5/+5 and has double strike,\" and equip {0}.\nNahiri, the Lithomancer can be your commander.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Kor Soldier Token", count: 1 },
          {
            kind: "attach",
            target: "created",
            choose: {
              filter: { subtype: "Equipment", controlledBy: "you" },
              prompt: "You may attach an Equipment you control to it",
              upTo: 1,
            },
          },
        ],
      },
      resolve: null,
      text: "+2: Create a 1/1 white Kor Soldier creature token. You may attach an Equipment you control to it.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put an Equipment card from your hand or graveyard onto the battlefield?",
        effect: {
          kind: "return-from-graveyard",
          filter: { type: "artifact", subtype: "Equipment" },
          destination: "battlefield",
          count: 1,
          from: "hand-or-graveyard",
        },
      },
      resolve: null,
      text: "−2: You may put an Equipment card from your hand or graveyard onto the battlefield.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Stoneforged Blade Token", count: 1 },
      resolve: null,
      text: "−10: Create a colorless Equipment artifact token named Stoneforged Blade. It has indestructible, \"Equipped creature gets +5/+5 and has double strike,\" and equip {0}.",
    },
  ],
});
