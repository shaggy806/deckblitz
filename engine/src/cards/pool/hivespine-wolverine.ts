import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 13305. Coliseum Behemoth's announced modal trigger: the
// mode, and its target, chosen as it goes on the stack (rule 700.2b).
const HEADER = "When this creature enters, choose one —";
const COUNTER = "Put a +1/+1 counter on target creature you control.";
const FIGHT = "This creature fights target creature token.";
const DESTROY = "Destroy target artifact or enchantment.";

export default defineCard({
  name: "Hivespine Wolverine",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Wolverine"],
  power: 5,
  toughness: 4,
  text: `${HEADER}\n• ${COUNTER}\n• ${FIGHT}\n• ${DESTROY}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: COUNTER,
            targets: ["creature-you-control"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            text: FIGHT,
            targets: [{ kind: "permanent", filter: { type: "creature", token: true } }],
            effect: { kind: "fight", a: "source", b: 0 },
          },
          {
            text: DESTROY,
            targets: ["artifact-or-enchantment"],
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: HEADER,
    },
  ],
});
