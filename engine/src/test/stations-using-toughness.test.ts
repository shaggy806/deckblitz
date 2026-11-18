/**
 * "Each creature you control with toughness greater than its power stations
 * permanents using its toughness rather than its power" (Tapestry Warden —
 * `StaticAbility.stationsByToughness`): station (rule 702.184a) puts charge
 * counters equal to the tapped creature's toughness instead, read as the
 * station ability resolves. No creature's power changes, and crew doesn't
 * read it (the rulings).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, pt, settle, spawn, table } from "./harness.js";

const HEARTHHULL = "Hearthhull, the Worldseed";
const charge = (game: Game, id: ObjectId): number => game.state.objects[id].counters.charge ?? 0;
const station = (game: Game, hull: ObjectId, creature: ObjectId): void => {
  const offer = game
    .legalActions(A)
    .find((a) => a.kind === "activate-ability" && a.source === hull && a.text.startsWith("Station"));
  if (offer === undefined || offer.kind !== "activate-ability") throw new Error("station isn't offered");
  game.dispatch({ type: "activate-ability", player: A, source: hull, abilityIndex: offer.abilityIndex, tap: [creature] });
};

describe("Tapestry Warden", () => {
  it("a creature with toughness greater than its power stations with its toughness", () => {
    const { game } = table();
    spawn(game, "Tapestry Warden", A);
    const hull = spawn(game, HEARTHHULL, A);
    // Wall of Omens: 0/4.
    const wall = spawn(game, "Wall of Omens", A);
    station(game, hull, wall);
    settle(game);
    expect(charge(game, hull)).toBe(4);
    expect(pt(game, wall).power).toBe(0);
  });

  it("one whose toughness isn't greater stations with its power", () => {
    const { game } = table();
    spawn(game, "Tapestry Warden", A);
    const hull = spawn(game, HEARTHHULL, A);
    // Hill Giant: 3/3.
    const giant = spawn(game, "Hill Giant", A);
    station(game, hull, giant);
    settle(game);
    expect(charge(game, hull)).toBe(3);
  });

  it("without the Warden, it's the power", () => {
    const { game } = table();
    const hull = spawn(game, HEARTHHULL, A);
    const wall = spawn(game, "Wall of Omens", A);
    station(game, hull, wall);
    settle(game);
    expect(charge(game, hull)).toBe(0);
  });

  it("gone before the station ability resolves, the Warden changes nothing", () => {
    const { game } = table();
    const warden = spawn(game, "Tapestry Warden", A);
    const hull = spawn(game, HEARTHHULL, A);
    const wall = spawn(game, "Wall of Omens", A);
    station(game, hull, wall);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: warden }]);
    settle(game);
    expect(charge(game, hull)).toBe(0);
  });

  it("a tapped creature that has left is read as it last existed", () => {
    const { game } = table();
    spawn(game, "Tapestry Warden", A);
    const hull = spawn(game, HEARTHHULL, A);
    const wall = spawn(game, "Wall of Omens", A);
    station(game, hull, wall);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: wall }]);
    settle(game);
    expect(game.state.objects[wall].zone).toBe("graveyard");
    expect(charge(game, hull)).toBe(4);
  });

  it("an opponent's Warden doesn't reach your creatures", () => {
    const { game } = table();
    spawn(game, "Tapestry Warden", B);
    const hull = spawn(game, HEARTHHULL, A);
    const wall = spawn(game, "Wall of Omens", A);
    station(game, hull, wall);
    settle(game);
    expect(charge(game, hull)).toBe(0);
  });
});
