import { defineCard } from "../define.js";

// EDHREC rank 20917. Modern Horizons 3. Reinforce (rule 702.77) is
// Brighthearth Banneret's hand ability: the card discarded as the cost.

const REINFORCE_TEXT =
  "Reinforce 2—{2}{G} ({2}{G}, Discard this card: Put two +1/+1 counters on target creature.)";

export default defineCard({
  name: "Fowl Strike",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Destroy target creature with flying.\n${REINFORCE_TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "destroy", target: 0 },
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: REINFORCE_TEXT,
      zone: "hand",
    },
  ],
});
