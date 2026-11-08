import { defineCard } from "../define.js";

const ENTERS =
  "When Urza enters, create a 0/0 colorless Construct artifact creature token with \"This token gets +1/+1 for each artifact you control.\"";
const MANA = "Tap an untapped artifact you control: Add {U}.";
const IMPULSE =
  "{5}: Shuffle your library, then exile the top card. Until end of turn, you may play that card without paying its mana cost.";

// The mana ability's tap-another cost is Moonsnare Prototype's (the player
// picks which artifact, any one, summoning-sick or not — its ruling). The
// exiled card keeps its normal timing (its ruling).
export default defineCard({
  name: "Urza, Lord High Artificer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 4,
  text: `${ENTERS}\n${MANA}\n${IMPULSE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Construct Token", count: 1 },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { type: "artifact", controlledBy: "you" }, includeSelf: true } },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: MANA,
    },
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-library" },
          { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true, free: true },
        ],
      },
      resolve: null,
      text: IMPULSE,
    },
  ],
});
