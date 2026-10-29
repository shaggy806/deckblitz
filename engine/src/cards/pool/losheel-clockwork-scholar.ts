import { defineCard } from "../define.js";

const DRAW_TEXT =
  "Whenever one or more artifact creatures you control enter, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Losheel, Clockwork Scholar",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elephant", "Artificer"],
  power: 2,
  toughness: 4,
  text: `Prevent all combat damage that would be dealt to attacking artifact creatures you control.\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        prevent: true,
        toFilter: { types: ["artifact", "creature"], attacking: true, controlledBy: "you" },
      },
      text: "Prevent all combat damage that would be dealt to attacking artifact creatures you control.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { types: ["artifact", "creature"] },
        batched: true,
      },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
