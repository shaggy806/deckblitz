import { defineCard } from "../define.js";

// EDHREC rank 17416.
//
// Its mode is chosen as it's activated, bringing that mode's target
// (rule 700.2b).

const TEXT =
  "{1}, Exile an instant or sorcery card from your graveyard: Choose one —\n• Counter target noncreature spell unless its controller pays {2}.\n• This creature gets +1/+1 until end of turn.\n• Tap target creature.\n• Untap target creature.";

export default defineCard({
  name: "Disciple of the Ring",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: false,
        exileFromGraveyard: { count: 1, filter: { typesAnyOf: ["instant", "sorcery"] } },
      },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Counter target noncreature spell unless its controller pays {2}.",
            targets: ["noncreature-spell"],
            effect: { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "counter", target: 0 } },
          },
          {
            text: "This creature gets +1/+1 until end of turn.",
            effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          },
          { text: "Tap target creature.", targets: ["creature"], effect: { kind: "tap", target: 0 } },
          { text: "Untap target creature.", targets: ["creature"], effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
