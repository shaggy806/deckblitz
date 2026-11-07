// "If a triggered ability of equipped creature triggers, that ability triggers
// an additional time" — `doubleTriggersOf`'s `host` (Wizard's Staff): the
// equipped creature's triggers, its own and those it's been granted, whoever
// controls it (rule 603.2d).
import { describe, expect, it } from "vitest";
import { A, B, activate, destroy, hand, lands, pt, ref, settle, spawn, table, toHand } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const EQUIP_WIZARD = 0;
const EQUIP = 1;

function equipped(game: Game, creature: ObjectId, ability = EQUIP): ObjectId {
  const staff = spawn(game, "Wizard's Staff");
  lands(game, "Wastes", 3);
  activate(game, staff, ability, { targets: [ref(creature)] });
  expect(game.state.objects[staff].attachedTo).toBe(creature);
  return staff;
}

describe("Wizard's Staff", () => {
  it("Equip Wizard {1} reaches only a Wizard; Equip {3} any creature you control", () => {
    const { game } = table();
    const familiar = spawn(game, "Palace Familiar");
    const cultist = spawn(game, "Exultant Cultist");
    const staff = spawn(game, "Wizard's Staff");
    lands(game, "Wastes", 4);
    expect(() => activate(game, staff, EQUIP_WIZARD, { targets: [ref(familiar)] })).toThrow(/target/i);
    activate(game, staff, EQUIP_WIZARD, { targets: [ref(cultist)] });
    expect(game.state.objects[staff].attachedTo).toBe(cultist);
    activate(game, staff, EQUIP, { targets: [ref(familiar)] });
    expect(game.state.objects[staff].attachedTo).toBe(familiar);
  });

  it("gives prowess, which then triggers twice", () => {
    const { game } = table();
    const familiar = spawn(game, "Palace Familiar");
    equipped(game, familiar);
    const ring = toHand(game, "Sol Ring");
    lands(game, "Wastes", 1);
    game.dispatch({ type: "cast-spell", player: A, card: ring, targets: [] });
    settle(game);
    expect(pt(game, familiar)).toEqual({ power: 3, toughness: 3 });
  });

  it("doubles the equipped creature's own dies trigger, and no other creature's", () => {
    const { game } = table();
    const cultist = spawn(game, "Exultant Cultist");
    const familiar = spawn(game, "Palace Familiar");
    equipped(game, cultist);
    const before = hand(game).length;
    destroy(game, familiar);
    expect(hand(game).length).toBe(before + 1);
    destroy(game, cultist);
    expect(hand(game).length).toBe(before + 3);
  });

  it("doubles the host's triggers when another player controls the host", () => {
    const { game } = table();
    const cultist = spawn(game, "Exultant Cultist");
    const staff = equipped(game, cultist);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(cultist)]);
    settle(game);
    expect(game.state.objects[cultist].controller).toBe(B);
    expect(game.state.objects[staff].attachedTo).toBe(cultist);
    const before = hand(game, B).length;
    destroy(game, cultist, A);
    expect(hand(game, B).length).toBe(before + 2);
  });

  it("doubles nothing once unattached", () => {
    const { game } = table();
    const cultist = spawn(game, "Exultant Cultist");
    spawn(game, "Wizard's Staff");
    const before = hand(game).length;
    destroy(game, cultist);
    expect(hand(game).length).toBe(before + 1);
  });
});
