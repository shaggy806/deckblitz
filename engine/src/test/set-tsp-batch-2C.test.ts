/**
 * Time Spiral, batch B228 group C.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const permanentsOf = (game: ReturnType<typeof table>["game"], player: string): number =>
  game.battlefield.filter((id) => game.state.objects[id].controller === player).length;

describe("Time Spiral group C", () => {
  it("Phyrexian Totem: damage to it as a creature sacrifices that many permanents", () => {
    const { game } = table();
    const totem = spawn(game, "Phyrexian Totem");
    lands(game, "Swamp", 4);
    activate(game, totem, 1);
    expect(pt(game, totem)).toEqual({ power: 5, toughness: 5 });
    expect(permanentsOf(game, A)).toBe(5);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(totem)]);
    settle(game);
    expect(permanentsOf(game, A)).toBe(3);
  });

  it("Phyrexian Totem: lethal damage still sacrifices that many (it was a creature as it left)", () => {
    const { game } = table();
    const totem = spawn(game, "Phyrexian Totem");
    lands(game, "Swamp", 3);
    activate(game, totem, 1);
    lands(game, "Wastes", 3);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(totem)]);
    settle(game);
    expect(zone(game, totem)).toBe("graveyard");
    expect(permanentsOf(game, A)).toBe(1);
  });

  it("Pendelhaven Elder: only the 1/1s it saw get +1/+2, and keep it", () => {
    const { game } = table();
    const elder = spawn(game, "Pendelhaven Elder");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Pendelhaven Elder", B);
    activate(game, elder);
    expect(pt(game, elder)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });

  it("Gustcloak Cavalier: when blocked it may untap and leave combat", () => {
    const { game, a, b } = table();
    const cavalier = spawn(game, "Gustcloak Cavalier");
    const wall = spawn(game, "Grizzly Bears", B);
    pickTargets(a, cavalier);
    pickModes(a, 0);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: cavalier }];
    a.declareAttackersFn = () => [{ attacker: cavalier, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, cavalier)).toBe("battlefield");
    expect(game.state.objects[cavalier].tapped).toBe(false);
    expect(game.state.objects[wall].damageMarked).toBe(0);
    expect(game.state.objects[cavalier].damageMarked).toBe(0);
  });

  it("Castle Raptors gets +0/+2 only while untapped", () => {
    const { game } = table();
    const raptors = spawn(game, "Castle Raptors");
    expect(pt(game, raptors)).toEqual({ power: 3, toughness: 5 });
    game.state.objects[raptors].tapped = true;
    expect(pt(game, raptors)).toEqual({ power: 3, toughness: 3 });
  });

  it("Plated Pegasus: a spell's damage is 1 less", () => {
    const { game } = table();
    spawn(game, "Plated Pegasus", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});
