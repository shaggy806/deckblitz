import { roomCard } from "../helpers.js";
import left from "./central-elevator.js";
import right from "./promising-stairs.js";

// Rulings:
//   [2024-09-20] Two or more objects (cards, permanents, spells, etc.) have the same name if they
//     have at least one name in common, even if one or more of those objects have additional
//     names. Central Elevator's ability lets you search your library for any Room card that
//     doesn't share a name with a Room you control on the battlefield, checking only the names of
//     unlocked doors. If a Room on the battlefield has no unlocked doors, it doesn't have either of
//     its names.
//   [2024-09-20] Promising Stairs's ability counts names, not permanents. A Room with two unlocked
//     doors has two names.

export default roomCard("Central Elevator // Promising Stairs", left, right);
