import { defineCard } from "../define.js";


export default defineCard({
  name: "Earthbrawn",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +3/+3 until end of turn.\nReinforce 1—{1}{G} ({1}{G}, Discard this card: Put a +1/+1 counter on target creature.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
  activated: [
    {
      // Reinforce (rule 702.77): a hand ability, discarding the card its cost.
      cost: { mana: "{1}{G}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Reinforce 1—{1}{G} ({1}{G}, Discard this card: Put a +1/+1 counter on target creature.)",
    },
  ],
});
