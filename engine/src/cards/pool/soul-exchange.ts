import { defineCard } from "../define.js";

// The creature exiled for the cost is read back as "the sacrificed" one, as
// it last existed (`exilesSacrifice`): the +2/+2 counter only if it was a
// Thrull. Exactly one is exiled (the ruling).

export default defineCard({
  name: "Soul Exchange",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature" }, exilesSacrifice: true },
  text: "As an additional cost to cast this spell, exile a creature you control.\nReturn target creature card from your graveyard to the battlefield. Put a +2/+2 counter on that creature if the exiled creature was a Thrull.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "sacrificed", filter: { subtype: "Thrull" } },
        then: { kind: "add-counter", target: 0, counter: "+2/+2", amount: 1 },
      },
    ],
  },
});
