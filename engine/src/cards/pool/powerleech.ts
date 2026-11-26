import { defineCard } from "../define.js";

// One ability with two trigger events, written as two triggers (Cryoshatter's
// shape). The activation half sees mana abilities too (`orMana`: the card
// doesn't say "that isn't a mana ability"), and only those whose cost has no
// {T} — one with {T} taps the artifact, which the first half sees instead.

const TEXT =
  "Whenever an artifact an opponent controls becomes tapped or an opponent activates an artifact's ability without {T} in its activation cost, you gain 1 life.";

export default defineCard({
  name: "Powerleech",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { type: "artifact", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: {
        on: "activates-ability",
        who: "opponent",
        source: { type: "artifact" },
        orMana: true,
        withoutTapCost: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
