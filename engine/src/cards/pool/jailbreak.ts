import { defineCard } from "../define.js";

// The second target is chosen only once the first card has entered (its
// ruling): a reflexive ability about the permanent put onto the battlefield,
// which doesn't trigger if it didn't enter, its mana value read as it entered.
export default defineCard({
  name: "Jailbreak",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target permanent card in an opponent's graveyard to the battlefield under their control. When that permanent enters, return up to one target permanent card with equal or lesser mana value from your graveyard to the battlefield.",
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { notTypes: ["instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "reflexive-trigger",
        about: "put-this-way",
        targets: [
          {
            kind: "optional",
            of: {
              kind: "card-in-graveyard",
              whose: "you",
              filter: {
                notTypes: ["instant", "sorcery"],
                manaValue: { op: "lte", n: { amount: { manaValueOf: "trigger-object" } } },
              },
            },
          },
        ],
        effect: { kind: "put-onto-battlefield", target: 0 },
        text: "When that permanent enters, return up to one target permanent card with equal or lesser mana value from your graveyard to the battlefield.",
      },
    ],
  },
});
