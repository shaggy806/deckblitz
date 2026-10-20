import { defineCard } from "../define.js";

// EDHREC rank 24189. Modern Horizons 2.
//
// Reinforce (rule 702.77a) is an ability from the hand, paid by discarding
// the card; scavenge (rule 702.97a) one from the graveyard, paid by exiling
// it, at sorcery speed, putting counters equal to the exiled card's power.
const REINFORCE_TEXT =
  "Reinforce 2—{1}{G} ({1}{G}, Discard this card: Put two +1/+1 counters on target creature.)";
const SCAVENGE_TEXT =
  "Scavenge {5}{G}{G} ({5}{G}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Bannerhide Krushok",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${REINFORCE_TEXT}\n${SCAVENGE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: REINFORCE_TEXT,
    },
    {
      cost: { mana: "{5}{G}{G}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});
