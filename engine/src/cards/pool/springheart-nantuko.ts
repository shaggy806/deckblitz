import { defineCard } from "../define.js";

// EDHREC rank 706.

const INSECT = { kind: "create-token", token: "Insect Token", count: 1 } as const;

export default defineCard({
  name: "Springheart Nantuko",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Insect", "Monk"],
  power: 1,
  toughness: 1,
  text: "Bestow {1}{G}\nEnchanted creature gets +1/+1.\nLandfall — Whenever a land you control enters, you may pay {1}{G} if this permanent is attached to a creature you control. If you do, create a token that's a copy of that creature. If you didn't create a token this way, create a 1/1 green Insect creature token.",
  bestow: "{1}{G}",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      // Not attached to a creature you control: no payment offered, the
      // Insect (the ruling). Declined or unpayable: the Insect too.
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { attachedTo: { type: "creature", controlledBy: "you" } } },
        then: {
          kind: "may",
          prompt: "Pay {1}{G} to create a token that's a copy of the enchanted creature?",
          cost: "{1}{G}",
          effect: { kind: "create-token-copy", of: "equipped", count: 1, who: "you" },
          else: INSECT,
        },
        else: INSECT,
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you may pay {1}{G} if this permanent is attached to a creature you control. If you do, create a token that's a copy of that creature. If you didn't create a token this way, create a 1/1 green Insect creature token.",
    },
  ],
});
