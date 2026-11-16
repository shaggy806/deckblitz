/**
 * `damage-all`'s `except` (Kusari-Gama: "whenever equipped creature deals
 * damage to a blocking creature, this Equipment deals that much damage to
 * each other creature defending player controls"): the blocker dealt the
 * damage is spared, the defending player is the one the equipped creature
 * attacks (rule 802.2a) — `{ defendingPlayerOf, orElse }` — or, for a
 * creature that isn't attacking, the blocking creature's controller.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, attack, life, pt, ref, settle, spawn, table, toStep, zone } from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

function equipped(game: Game, creature: string, player: PlayerId = A): ObjectId {
  const host = spawn(game, creature, player);
  const gama = spawn(game, "Kusari-Gama", player);
  game.debugApplyEffect(player, { kind: "attach", target: 0, attachment: 1 }, [ref(host), ref(gama)]);
  settle(game);
  expect(game.state.objects[gama].attachedTo).toBe(host);
  return host;
}

describe("Kusari-Gama", () => {
  it("deals what its creature dealt the blocker to each other creature the defending player controls", () => {
    const { game, a, b } = table();
    const giant = equipped(game, "Hill Giant");
    const wall = spawn(game, "Wall of Wood", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const mine = spawn(game, "Grizzly Bears", A);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    attack(game, a, [giant]);
    // Hill Giant dealt 3 to the wall (lethal): 3 to each of bob's other
    // creatures, the wall spared.
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(damage(game, wurm)).toBe(3);
    expect(damage(game, mine)).toBe(0);
    expect(life(game, B)).toBe(20);
  });

  it("deals nothing when its creature is unblocked", () => {
    const { game, a } = table();
    const giant = equipped(game, "Hill Giant");
    const courser = spawn(game, "Centaur Courser", B);
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(17);
    expect(damage(game, courser)).toBe(0);
  });

  it("reaches only the player its creature attacks, at a table of three", () => {
    const { game, a, b } = table({ players: 3 });
    const giant = equipped(game, "Hill Giant");
    const wall = spawn(game, "Wall of Wood", B);
    const theirs = spawn(game, "Craw Wurm", B);
    const carols = spawn(game, "Craw Wurm", C);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    attack(game, a, [giant]);
    expect(damage(game, theirs)).toBe(3);
    expect(damage(game, carols)).toBe(0);
  });

  it("a creature that isn't attacking pinging a blocker: the blocker's controller's other creatures", () => {
    const { game, a, b } = table();
    const sorcerer = equipped(game, "Prodigal Sorcerer");
    const bears = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Wall of Wood", B);
    const courser = spawn(game, "Centaur Courser", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(game.state.objects[wall].blocking).toBeTruthy();
    activate(game, sorcerer, 0, { targets: [ref(wall)] });
    expect(damage(game, wall)).toBe(1);
    expect(damage(game, courser)).toBe(1);
    expect(damage(game, bears)).toBe(0);
  });

  it("a creature that isn't blocking is no trigger", () => {
    const { game } = table();
    const sorcerer = equipped(game, "Prodigal Sorcerer");
    const wall = spawn(game, "Wall of Wood", B);
    const courser = spawn(game, "Centaur Courser", B);
    activate(game, sorcerer, 0, { targets: [ref(wall)] });
    expect(damage(game, wall)).toBe(1);
    expect(damage(game, courser)).toBe(0);
  });

  it("gives its creature \"{2}: +1/+0\"", () => {
    const { game } = table();
    const giant = equipped(game, "Hill Giant");
    spawn(game, "Wastes", A);
    spawn(game, "Wastes", A);
    activate(game, giant, 0);
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 3 });
  });
});
