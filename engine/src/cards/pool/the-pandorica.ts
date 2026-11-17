import { defineCard } from "../define.js";

const NO_UNTAP = "You may choose not to untap The Pandorica during your untap step.";
const SEAL =
  "{1}{W}, {T}: Untap another target nonland permanent, then it phases out. It can't phase in for as long as The Pandorica remains tapped. When The Pandorica becomes untapped or leaves the battlefield, that permanent phases in. Activate only as a sorcery.";

export default defineCard({
  name: "The Pandorica",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  supertypes: ["legendary"],
  text: `${NO_UNTAP}\n${SEAL}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: NO_UNTAP }],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "other", of: "nonland-permanent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "phase-out", target: 0, cantPhaseIn: "while-source-tapped" },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "event", event: "becomes-untapped", who: "self" },
              watching: "source",
              until: "permanent",
              once: true,
              orLeaves: "source",
            },
            effect: { kind: "phase-in", target: 0 },
            text: "When The Pandorica becomes untapped or leaves the battlefield, that permanent phases in.",
          },
        ],
      },
      sorcerySpeed: true,
      resolve: null,
      text: SEAL,
    },
  ],
});
