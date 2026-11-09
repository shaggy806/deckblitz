import { defineCard } from "../define.js";

// "Each of that creature's colors", read just before it left (the ruling): the
// target is exiled first, so the bound `sharesColorWith` reads its last-known
// colors; a colorless creature gives no protection.
const TEXT =
  "When Éowyn enters, exile target creature an opponent controls with greater power. Legendary creatures you control gain protection from each of that creature's colors until end of turn.";

export default defineCard({
  name: "Éowyn, Fearless Knight",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", power: { op: "gt", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "grant-protection",
            filter: { type: "creature", supertype: "legendary", controlledBy: "you" },
            from: { filter: { sharesColorWith: 0 } },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
