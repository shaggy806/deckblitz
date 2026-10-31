import { defineCard } from "../define.js";

// The Aura enters attached to a creature you control chosen as it enters
// (`attachedTo: { among }` — rule 303.4f, limited to those): with none it can
// legally enchant, it stays in the graveyard (303.4g).

const TEXT =
  "{W}, {T}: Put target Aura card from a graveyard onto the battlefield under your control attached to a creature you control.";

export default defineCard({
  name: "Nomad Mythmaker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { subtype: "Aura" } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        underYourControl: true,
        attachedTo: { among: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
