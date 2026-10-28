import { defineCard } from "../define.js";

// EDHREC rank 21211.

export default defineCard({
  name: "Cathedral of Serra",
  colors: [],
  types: ["land"],
  text: "White legendary creatures you control have \"bands with other legendary creatures.\" (Any legendary creatures can attack in a band as long as at least one has \"bands with other legendary creatures.\" Bands are blocked as a group. If at least two legendary creatures you control, one of which has \"bands with other legendary creatures,\" are blocking or being blocked by the same creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", supertype: "legendary", colors: ["W"], controlledBy: "you" },
      },
      bandsWithOther: { type: "creature", supertype: "legendary" },
      text: "White legendary creatures you control have \"bands with other legendary creatures.\"",
    },
  ],
});
