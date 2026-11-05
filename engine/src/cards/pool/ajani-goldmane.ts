import { defineCard } from "../define.js";

export default defineCard({
  name: "Ajani Goldmane",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 4,
  text: "+1: You gain 2 life.\n−1: Put a +1/+1 counter on each creature you control. Those creatures gain vigilance until end of turn.\n−6: Create a white Avatar creature token. It has \"This token's power and toughness are each equal to your life total.\"",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "+1: You gain 2 life.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      // The creatures that get the counters are the ones you control as it
      // resolves, the same set the vigilance grant reads in the same instant.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "−1: Put a +1/+1 counter on each creature you control. Those creatures gain vigilance until end of turn.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Avatar Token", count: 1 },
      resolve: null,
      text: "−6: Create a white Avatar creature token. It has \"This token's power and toughness are each equal to your life total.\"",
    },
  ],
});
