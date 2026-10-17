import { defineCard } from "../define.js";

// EDHREC rank 8167. March of the Machine: The Aftermath.
//
// Rulings:
//   [2023-05-12] The cost-reduction ability of Animist's Might doesn't change its mana cost or
//     mana value, only the total cost you pay. Specifically, the mana value of Animist's Might is
//     always 3.
//
// Price of Fame's target discount, narrowed to a legendary creature *you
// control* (the second slot can never be one: it's a permanent you don't
// control), and Punishing Punch's damage — the first target's power read as it
// resolves, twice over, dealt by that creature — aimed at Bite Down's
// "creature or planeswalker you don't control". Either target illegal, nothing
// is dealt: with the second gone the damage has nowhere to go, with the first
// gone it has no source.
export default defineCard({
  name: "Animist's Might",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if it targets a legendary creature you control.\nTarget creature you control deals damage equal to twice its power to target creature or planeswalker you don't control.",
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
  ],
  targetCostReduction: {
    filter: { supertype: "legendary", type: "creature", controlledBy: "you" },
    reduceGeneric: 2,
  },
  effect: { kind: "damage", amount: { product: [{ powerOf: 0 }, 2] }, target: 1, from: { target: 0 } },
});
