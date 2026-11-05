import { defineCard } from "../define.js";

const TEXT =
  "{T}: Return target card from an opponent's graveyard to their hand. Prevent all damage that would be dealt to any target this turn by a source of your choice.";

export default defineCard({
  name: "Shieldmage Advocate",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }, "any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "prevent-damage-from-chosen-source", to: 1, amount: "all" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
