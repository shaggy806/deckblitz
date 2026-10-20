import { defineCard } from "../define.js";

// EDHREC rank 1803.

export default defineCard({
  name: "Lion Sash",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Cat"],
  power: 1,
  toughness: 1,
  text: "{W}: Exile target card from a graveyard. If it was a permanent card, put a +1/+1 counter on this permanent.\nEquipped creature gets +1/+1 for each +1/+1 counter on this Equipment.\nReconfigure {2} ({2}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      // A permanent card: any card that isn't an instant or a sorcery.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { notTypes: ["instant", "sorcery"] } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "{W}: Exile target card from a graveyard. If it was a permanent card, put a +1/+1 counter on this permanent.",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {2}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {2}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "+1/+1", pt: [1, 1] },
      text: "Equipped creature gets +1/+1 for each +1/+1 counter on this Equipment.",
    },
  ],
});
