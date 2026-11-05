import { defineCard } from "../define.js";

// EDHREC rank 10698. Both targets chosen as it's cast, the recipients as it
// resolves, so the returned permanent may be one (the ruling).
export default defineCard({
  name: "Invoke Justice",
  manaCost: "{1}{W}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target permanent card from your graveyard to the battlefield, then distribute four +1/+1 counters among any number of creatures and/or Vehicles target player controls.",
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
    },
    "player",
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "counters-distributed",
        counter: "+1/+1",
        total: 4,
        filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }], controlledBy: "you" },
        controlledByTarget: 1,
        among: "creatures and/or Vehicles target player controls",
      },
    ],
  },
});
