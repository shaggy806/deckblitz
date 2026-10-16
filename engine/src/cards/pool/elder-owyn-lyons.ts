import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 11647. Fallout.
//
// "Artifacts you control have ward {1}" is Bronze Guardian's granted ward,
// over every artifact you control (Elder Owyn Lyons isn't one). "Enters or
// dies" is two triggers with the one return.
const WARD_TEXT =
  "Artifacts you control have ward {1}. (Whenever an artifact you control becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)";
const RETURN_TEXT = "When Elder Owyn Lyons enters or dies, return target artifact card from your graveyard to your hand.";

export default defineCard({
  name: "Elder Owyn Lyons",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: `${WARD_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      grantsTriggered: [ward({ mana: "{1}" })],
      text: "Artifacts you control have ward {1}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
