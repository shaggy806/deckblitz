import { defineCard } from "../define.js";

// EDHREC rank 8696.
// Makes Food → use "Food Token".
//
// Rulings:
//   [2025-10-02] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Tough Cookie (an Artifact Creature — Food
//     Golem) to activate Bosco, Just a Bear's ability (an ability with "Sacrifice a Food" in its
//     cost). You can't sacrifice a Food to pay multiple costs. For example, you can't sacrifice a
//     Food token to activate its own ability and also to activate Bosco, Just a Bear's ability.
//   [2025-10-02] Some spells and abilities that create Food tokens may require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve. You won't create any Food tokens.
//   [2025-10-02] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2025-10-02] Whatever you do, don't eat the delicious cards.

export default defineCard({
  name: "Momo, Playful Pet",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lemur", "Bat", "Ally"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nWhen Momo leaves the battlefield, choose one —\n• Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\n• Put a +1/+1 counter on target creature you control.\n• Scry 2.",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      // The mode is chosen as the ability goes on the stack (rule 700.2b).
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Create a Food token.", effect: { kind: "create-token", token: "Food Token", count: 1 } },
          {
            text: "Put a +1/+1 counter on target creature you control.",
            targets: ["creature-you-control"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          { text: "Scry 2.", effect: { kind: "scry", amount: 2 } },
        ],
      },
      resolve: null,
      text: "When Momo leaves the battlefield, choose one — Create a Food token. Put a +1/+1 counter on target creature you control. Scry 2.",
    },
  ],
});
