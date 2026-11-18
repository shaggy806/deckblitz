/**
 * Token copies of a permanent's attachments, attached to a token made in the
 * same resolution (rules 303.4i, 301.5e, 707.2) — Stangg, Echo Warrior:
 * "Whenever Stangg attacks, create Stangg Twin … It enters tapped and
 * attacking. For each Aura and Equipment attached to Stangg, create a token
 * that's a copy of it attached to Stangg Twin. Sacrifice all tokens created
 * this way at the beginning of the next end step."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, controller, named, pt, ref, settle, spawn, table, toStep, zone } from "./harness.js";

const attachTo = (game: Game, attachment: ObjectId, host: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(host), ref(attachment)]);
};

const twinOf = (game: Game): ObjectId => {
  const [twin] = named(game, "Stangg Twin");
  expect(twin).toBeDefined();
  return twin;
};

const copiesOf = (game: Game, name: string, except: ObjectId): ObjectId[] => named(game, name).filter((id) => id !== except);

describe("token copies of attachments, attached to the new token (Stangg, Echo Warrior)", () => {
  it("makes the Twin tapped and attacking, and a copy of each Aura and Equipment on Stangg attached to it", () => {
    const { game, a } = table();
    const stangg = spawn(game, "Stangg, Echo Warrior");
    const strength = spawn(game, "Holy Strength");
    const splitter = spawn(game, "Bonesplitter");
    attachTo(game, strength, stangg);
    attachTo(game, splitter, stangg);
    a.declareAttackersFn = () => [{ attacker: stangg, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    const twin = twinOf(game);
    expect(game.state.objects[twin].tapped).toBe(true);
    expect(game.state.objects[twin].attacking).toBe(B);
    const [auraCopy] = copiesOf(game, "Holy Strength", strength);
    const [equipCopy] = copiesOf(game, "Bonesplitter", splitter);
    expect(game.state.objects[auraCopy].isToken).toBe(true);
    expect(game.state.objects[auraCopy].attachedTo).toBe(twin);
    expect(game.state.objects[equipCopy].isToken).toBe(true);
    expect(game.state.objects[equipCopy].attachedTo).toBe(twin);
    expect(controller(game, auraCopy)).toBe(A);
    // Holy Strength's +1/+2 and Bonesplitter's +2/+0 on a 3/4.
    expect(pt(game, twin)).toEqual({ power: 6, toughness: 6 });
    // The originals stay on Stangg.
    expect(game.state.objects[strength].attachedTo).toBe(stangg);
    expect(game.state.objects[splitter].attachedTo).toBe(stangg);
  });

  it("sacrifices every token it made at the next end step: the Twin and the copies", () => {
    const { game, a } = table();
    const stangg = spawn(game, "Stangg, Echo Warrior");
    const strength = spawn(game, "Holy Strength");
    const splitter = spawn(game, "Bonesplitter");
    attachTo(game, strength, stangg);
    attachTo(game, splitter, stangg);
    attack(game, a, [stangg]);
    const twin = twinOf(game);
    const [auraCopy] = copiesOf(game, "Holy Strength", strength);
    const [equipCopy] = copiesOf(game, "Bonesplitter", splitter);
    for (const made of [twin, auraCopy, equipCopy]) expect(zone(game, made)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Stangg Twin")).toHaveLength(0);
    expect(game.state.objects[twin]?.zone ?? "gone").not.toBe("battlefield");
    expect(game.state.objects[auraCopy]?.zone ?? "gone").not.toBe("battlefield");
    expect(game.state.objects[equipCopy]?.zone ?? "gone").not.toBe("battlefield");
    // Stangg and the cards attached to it stay.
    expect(zone(game, stangg)).toBe("battlefield");
    expect(zone(game, strength)).toBe("battlefield");
    expect(zone(game, splitter)).toBe("battlefield");
  });

  it("with nothing attached, makes only the Twin", () => {
    const { game, a } = table();
    const stangg = spawn(game, "Stangg, Echo Warrior");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [stangg]);
    twinOf(game);
    expect(named(game, "Grizzly Bears")).toEqual([bears]);
  });

  it("copies an opponent's Aura on Stangg too, the copy Stangg's controller's: they create it", () => {
    const { game, a } = table();
    const stangg = spawn(game, "Stangg, Echo Warrior");
    const theirs = spawn(game, "Holy Strength", B);
    game.debugApplyEffect(B, { kind: "attach", target: 0, attachment: 1 }, [ref(stangg), ref(theirs)]);
    expect(game.state.objects[theirs].attachedTo).toBe(stangg);
    attack(game, a, [stangg]);
    const twin = twinOf(game);
    const [copy] = copiesOf(game, "Holy Strength", theirs);
    expect(copy).toBeDefined();
    expect(controller(game, copy)).toBe(A);
    expect(game.state.objects[copy].attachedTo).toBe(twin);
  });
});
