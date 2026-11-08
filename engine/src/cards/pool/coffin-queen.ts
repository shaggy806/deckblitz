import { defineCard } from "../define.js";

const NO_UNTAP = "You may choose not to untap this creature during your untap step.";
const REANIMATE =
  "{2}{B}, {T}: Put target creature card from a graveyard onto the battlefield under your control. When this creature becomes untapped or you lose control of this creature, exile that creature.";

export default defineCard({
  name: "Coffin Queen",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${NO_UNTAP}\n${REANIMATE}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: NO_UNTAP }],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0, underYourControl: true },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "event", event: "becomes-untapped", who: "self" },
              watching: "source",
              until: "permanent",
              once: true,
              orLosesControl: "source",
            },
            about: "put-onto-battlefield",
            effect: { kind: "exile", target: 0 },
            text: "When this creature becomes untapped or you lose control of this creature, exile that creature.",
          },
        ],
      },
      resolve: null,
      text: REANIMATE,
    },
  ],
});
