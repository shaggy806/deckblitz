import { defineCard } from "../define.js";

const TEXT =
  "{T}: Return target card from an opponent's graveyard to their hand. Put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Forcemage Advocate",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }, "creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
