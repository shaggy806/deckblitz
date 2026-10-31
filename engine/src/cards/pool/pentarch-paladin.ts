import { defineCard } from "../define.js";

// EDHREC rank 19470.
//
// "Target permanent of the chosen color": the slot's filter reads the colour
// chosen as it entered (`ofChosenColor`) — no colour chosen, nothing to target.

const FLANKING =
  "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)";
const CHOOSE = "As this creature enters, choose a color.";
const DESTROY = "{W}{W}, {T}: Destroy target permanent of the chosen color.";

export default defineCard({
  name: "Pentarch Paladin",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flanking"],
  text: `${FLANKING}\n${CHOOSE}\n${DESTROY}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Flanking",
    },
  ],
  activated: [
    {
      cost: { mana: "{W}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { ofChosenColor: true } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY,
    },
  ],
});
