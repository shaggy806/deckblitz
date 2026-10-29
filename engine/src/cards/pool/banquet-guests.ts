import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 4552.
//
// Rulings:
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs.
//   [2024-11-08] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token.
//
// Affinity reduces the total cost's generic mana, X included (rule 601.2f);
// the counters are twice the X announced, whatever was paid for it.

const ENTERS_TEXT = "This creature enters with twice X +1/+1 counters on it.";

export default defineCard({
  name: "Banquet Guests",
  manaCost: "{X}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Affinity for Foods (This spell costs {1} less to cast for each Food you control.)\nTrample\n${ENTERS_TEXT}\n{2}, Sacrifice a Food: This creature gains indestructible until end of turn.`,
  selfCostReduction: affinity({ subtype: "Food" }),
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { product: ["x", 2] } } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { subtype: "Food" } } },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}, Sacrifice a Food: This creature gains indestructible until end of turn.",
    },
  ],
});
