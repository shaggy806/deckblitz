import { defineCard } from "../define.js";


export default defineCard({
  name: "Rustic Clachan",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may reveal a Kithkin card from your hand. If you don't, this land enters tapped.\n{T}: Add {W}.\nReinforce 1—{1}{W} ({1}{W}, Discard this card: Put a +1/+1 counter on target creature.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
    {
      // Reinforce (rule 702.77): a hand ability, discarding the card its cost.
      cost: { mana: "{1}{W}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Reinforce 1—{1}{W} ({1}{W}, Discard this card: Put a +1/+1 counter on target creature.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnlessRevealFromHand: ["Kithkin"] },
      text: "As this land enters, you may reveal a Kithkin card from your hand. If you don't, this land enters tapped.",
    },
  ],
});
