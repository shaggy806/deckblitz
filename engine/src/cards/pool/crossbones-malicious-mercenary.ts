import { defineCard } from "../define.js";

// EDHREC rank 14488. Marvel Super Heroes.
//
// Flying Octobot's trigger (any Villain permanent you control, once each
// turn), with Brallin's "and it deals damage to each opponent" after the
// counter: Crossbones is the source of the damage.
const TEXT =
  "Whenever another Villain you control enters, put a +1/+1 counter on Crossbones. He deals 2 damage to each opponent. This ability triggers only once each turn.";

export default defineCard({
  name: "Crossbones, Malicious Mercenary",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Villain" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "damage", amount: 2, who: "each-opponent" },
        ],
      },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
