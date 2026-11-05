import { defineCard } from "../define.js";

// Activated only from the graveyard (its ruling); X may be 0. The Aura goes on
// as Academy Researchers' does, attached to it; with none put on — none in
// hand, none chosen, or one that can't legally enchant it — it's exiled, and
// nobody gets priority in between (its rulings).
const PUMP = "This creature gets +2/+2 for each Aura attached to it.";
const RETURN =
  "{X}{W/B}{W/B}: Return this card from your graveyard to the battlefield. You may put an Aura card with mana value X or less from your hand onto the battlefield attached to it. If you don't, exile this creature.";

export default defineCard({
  name: "Evershrike",
  manaCost: "{3}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${PUMP}\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{X}{W/B}{W/B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "source-on-battlefield" },
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "look-and-choose",
                  zone: "hand",
                  min: 0,
                  max: 1,
                  filter: { subtype: "Aura", manaValue: { op: "lte", n: "x" } },
                  destination: "battlefield",
                  attachedTo: "source",
                  leftover: "stay",
                },
                {
                  kind: "conditional",
                  condition: {
                    kind: "not",
                    of: { kind: "this-way", what: "put-onto-battlefield", filter: { subtype: "Aura" } },
                  },
                  then: { kind: "exile", target: "source" },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: RETURN,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Aura", attachedTo: { isSource: true } }, pt: [2, 2] },
      text: PUMP,
    },
  ],
});
